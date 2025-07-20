// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";
import {Currency} from "v4-core/types/Currency.sol";
import {IHooks} from "v4-core/interfaces/IHooks.sol";
import {TickMath} from "v4-core/libraries/TickMath.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IANVLToken {
    function setAuthorization(address account, bool authorized) external;
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface ILendingPlatform {
    function depositCollateral(address dealer, uint256 amount) external;
}

/**
 * @title ANVLLBPManager
 * @dev Manages the ANVL liquidity bootstrapping pool and integrates with the lending platform
 */
contract ANVLLBPManager is Ownable {
    using SafeERC20 for IERC20;
    
    IPoolManager public immutable poolManager;
    IANVLToken public immutable anvlToken;
    ILendingPlatform public lendingPlatform;
    address public lbpHook;
    
    // LBP Configuration
    struct LBPParams {
        address baseToken;      // ETH/USDC
        uint256 anvlAmount;     // Amount of ANVL tokens for LBP
        uint256 baseAmount;     // Initial base token amount
        uint24 fee;            // Pool fee tier
        int24 tickSpacing;     // Tick spacing
        uint256 startTime;     // LBP start time
        uint256 duration;      // LBP duration in seconds
        uint256 startWeight;   // Starting weight for ANVL (basis points)
        uint256 endWeight;     // Ending weight for ANVL (basis points)
    }
    
    PoolKey public lbpPoolKey;
    bool public lbpInitialized;
    
    // Track participants for collateral distribution
    mapping(address => uint256) public participantPurchases;
    address[] public participants;
    
    event LBPInitialized(PoolKey poolKey, uint256 startTime, uint256 endTime);
    event TokensPurchased(address indexed buyer, uint256 baseAmount, uint256 anvlAmount);
    event CollateralDistributed(address indexed dealer, uint256 amount);
    event LendingPlatformSet(address indexed platform);
    
    constructor(
        IPoolManager _poolManager,
        IANVLToken _anvlToken,
        address _lbpHook
    ) {
        poolManager = _poolManager;
        anvlToken = _anvlToken;
        lbpHook = _lbpHook;
    }
    
    /**
     * @dev Set the lending platform address
     */
    function setLendingPlatform(address _lendingPlatform) external onlyOwner {
        require(_lendingPlatform != address(0), "Invalid address");
        lendingPlatform = ILendingPlatform(_lendingPlatform);
        emit LendingPlatformSet(_lendingPlatform);
    }
    
    /**
     * @dev Initialize the LBP pool
     */
    function initializeLBP(LBPParams calldata params) external onlyOwner {
        require(!lbpInitialized, "LBP already initialized");
        require(params.anvlAmount > 0, "Invalid ANVL amount");
        require(params.baseAmount > 0, "Invalid base amount");
        require(params.startTime > block.timestamp, "Invalid start time");
        
        // Transfer ANVL tokens to this contract
        require(
            anvlToken.transfer(address(this), params.anvlAmount),
            "ANVL transfer failed"
        );
        
        // Create pool key
        Currency currency0 = Currency.wrap(params.baseToken);
        Currency currency1 = Currency.wrap(address(anvlToken));
        
        // Ensure correct token ordering (token0 < token1)
        if (params.baseToken > address(anvlToken)) {
            (currency0, currency1) = (currency1, currency0);
        }
        
        lbpPoolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: params.fee,
            tickSpacing: params.tickSpacing,
            hooks: IHooks(lbpHook)
        });
        
        // Calculate initial sqrt price based on weights
        uint160 sqrtPriceX96 = _calculateInitialSqrtPrice(
            params.anvlAmount,
            params.baseAmount,
            params.startWeight
        );
        
        // Encode hook data
        bytes memory hookData = abi.encode(
            params.startTime,
            params.startTime + params.duration,
            params.startWeight,
            params.endWeight,
            address(this)
        );
        
        // Initialize the pool
        poolManager.initialize(lbpPoolKey, sqrtPriceX96, hookData);
        
        // Add initial liquidity
        _addInitialLiquidity(params.anvlAmount, params.baseAmount);
        
        lbpInitialized = true;
        
        emit LBPInitialized(
            lbpPoolKey,
            params.startTime,
            params.startTime + params.duration
        );
    }
    
    /**
     * @dev Calculate initial sqrt price based on weights
     */
    function _calculateInitialSqrtPrice(
        uint256 anvlAmount,
        uint256 baseAmount,
        uint256 anvlWeight
    ) internal pure returns (uint160) {
        // Price = (baseAmount * baseWeight) / (anvlAmount * anvlWeight)
        // Where baseWeight = 10000 - anvlWeight
        uint256 baseWeight = 10000 - anvlWeight;
        
        // Calculate price ratio
        uint256 priceRatio = (baseAmount * baseWeight * 1e18) / (anvlAmount * anvlWeight);
        
        // Convert to sqrtPriceX96 format
        // This is a simplified calculation - production would need more precision
        uint256 sqrtPrice = sqrt(priceRatio);
        return uint160((sqrtPrice * 2**96) / 1e9);
    }
    
    /**
     * @dev Add initial liquidity to the pool
     */
    function _addInitialLiquidity(uint256 anvlAmount, uint256 baseAmount) internal {
        // Approve tokens to pool manager
        IERC20(address(anvlToken)).approve(address(poolManager), anvlAmount);
        
        // Add liquidity
        // This is simplified - actual implementation would use proper liquidity parameters
        int24 tickLower = TickMath.minUsableTick(lbpPoolKey.tickSpacing);
        int24 tickUpper = TickMath.maxUsableTick(lbpPoolKey.tickSpacing);
        
        IPoolManager.ModifyLiquidityParams memory params = IPoolManager.ModifyLiquidityParams({
            tickLower: tickLower,
            tickUpper: tickUpper,
            liquidityDelta: int256(anvlAmount),
            salt: bytes32(0)
        });
        
        poolManager.modifyLiquidity(lbpPoolKey, params, "");
    }
    
    /**
     * @dev Purchase ANVL tokens (called by users through a router)
     */
    function purchaseANVL(uint256 baseAmount, uint256 minANVLOut) external returns (uint256) {
        require(lbpInitialized, "LBP not initialized");
        
        // Transfer base tokens from user
        IERC20 baseToken = IERC20(Currency.unwrap(lbpPoolKey.currency0));
        baseToken.safeTransferFrom(msg.sender, address(this), baseAmount);
        
        // Approve base tokens to pool manager
        baseToken.approve(address(poolManager), baseAmount);
        
        // Execute swap
        IPoolManager.SwapParams memory swapParams = IPoolManager.SwapParams({
            zeroForOne: true, // Swap base token for ANVL
            amountSpecified: int256(baseAmount),
            sqrtPriceLimitX96: TickMath.MIN_SQRT_PRICE + 1
        });
        
        BalanceDelta delta = poolManager.swap(lbpPoolKey, swapParams, "");
        
        uint256 anvlReceived = uint256(int256(-delta.amount1()));
        require(anvlReceived >= minANVLOut, "Slippage exceeded");
        
        // Transfer ANVL to buyer
        anvlToken.transfer(msg.sender, anvlReceived);
        
        // Track purchase for collateral distribution
        if (participantPurchases[msg.sender] == 0) {
            participants.push(msg.sender);
        }
        participantPurchases[msg.sender] += anvlReceived;
        
        emit TokensPurchased(msg.sender, baseAmount, anvlReceived);
        
        return anvlReceived;
    }
    
    /**
     * @dev Distribute ANVL as collateral to dealers who participated in LBP
     */
    function distributeCollateral() external onlyOwner {
        require(address(lendingPlatform) != address(0), "Lending platform not set");
        
        for (uint256 i = 0; i < participants.length; i++) {
            address dealer = participants[i];
            uint256 amount = participantPurchases[dealer];
            
            if (amount > 0) {
                // Authorize dealer in ANVL token
                anvlToken.setAuthorization(dealer, true);
                
                // Deposit ANVL as collateral in lending platform
                anvlToken.approve(address(lendingPlatform), amount);
                lendingPlatform.depositCollateral(dealer, amount);
                
                emit CollateralDistributed(dealer, amount);
            }
        }
    }
    
    /**
     * @dev Withdraw remaining tokens after LBP ends
     */
    function withdrawRemaining() external onlyOwner {
        uint256 anvlBalance = anvlToken.balanceOf(address(this));
        if (anvlBalance > 0) {
            anvlToken.transfer(owner(), anvlBalance);
        }
        
        // Also withdraw any base tokens
        IERC20 baseToken = IERC20(Currency.unwrap(lbpPoolKey.currency0));
        uint256 baseBalance = baseToken.balanceOf(address(this));
        if (baseBalance > 0) {
            baseToken.safeTransfer(owner(), baseBalance);
        }
    }
    
    /**
     * @dev Simple square root function for price calculation
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}
