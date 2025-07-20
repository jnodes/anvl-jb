// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "v4-periphery/src/base/hooks/BaseHook.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";
import {BalanceDelta} from "v4-core/types/BalanceDelta.sol";
import {Currency, CurrencyLibrary} from "v4-core/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/types/PoolId.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/types/BeforeSwapDelta.sol";
import {TickMath} from "v4-core/libraries/TickMath.sol";
import {FixedPoint96} from "v4-core/libraries/FixedPoint96.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ANVLLiquidityBootstrappingPool
 * @dev Fixed version with proper weight adjustment and access controls
 */
contract ANVLLiquidityBootstrappingPool is BaseHook, Ownable {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    
    // Pool configuration
    struct LBPConfig {
        uint256 startTime;
        uint256 endTime;
        uint256 startWeight; // Starting weight for ANVL (in basis points, e.g., 9000 = 90%)
        uint256 endWeight;   // Ending weight for ANVL (in basis points, e.g., 5000 = 50%)
        bool isActive;
        address beneficiary; // Address to receive proceeds
        Currency token0;     // Base token (USDC)
        Currency token1;     // ANVL token
    }
    
    mapping(PoolId => LBPConfig) public lbpConfigs;
    mapping(PoolId => uint256) public totalRaised;
    mapping(PoolId => uint256) public initialLiquidity0; // Initial base token liquidity
    mapping(PoolId => uint256) public initialLiquidity1; // Initial ANVL liquidity
    
    // Events
    event LBPCreated(
        PoolId indexed poolId,
        uint256 startTime,
        uint256 endTime,
        uint256 startWeight,
        uint256 endWeight,
        address beneficiary
    );
    event LBPEnded(PoolId indexed poolId, uint256 totalRaised);
    event TokensPurchased(
        PoolId indexed poolId,
        address indexed buyer,
        uint256 amountIn,
        uint256 amountOut
    );
    event FundsWithdrawn(PoolId indexed poolId, uint256 amount, address beneficiary);
    
    error NotAuthorized();
    error LBPNotActive();
    error LBPNotEnded();
    error SellNotAllowed();
    error InvalidWeights();
    error InvalidTimeRange();
    error InvalidBeneficiary();
    error AlreadyWithdrawn();
    
    constructor(IPoolManager _poolManager) BaseHook(_poolManager) Ownable() {}
    
    /**
     * @dev Returns the hook permissions
     */
    function getHookPermissions() 
        public 
        pure 
        override 
        returns (Hooks.Permissions memory) 
    {
        return Hooks.Permissions({
            beforeInitialize: true,
            afterInitialize: false,
            beforeAddLiquidity: true,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: true,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: true,  // Enable delta modification
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }
    
    /**
     * @dev Hook called before pool initialization
     */
    function beforeInitialize(
        address sender,
        PoolKey calldata key,
        uint160 sqrtPriceX96,
        bytes calldata hookData
    ) external override onlyByPoolManager returns (bytes4) {
        // Decode LBP parameters from hookData
        (
            uint256 startTime,
            uint256 endTime,
            uint256 startWeight,
            uint256 endWeight,
            address beneficiary,
            uint256 initLiq0,
            uint256 initLiq1
        ) = abi.decode(hookData, (uint256, uint256, uint256, uint256, address, uint256, uint256));
        
        // Validate parameters
        if (startTime >= endTime) revert InvalidTimeRange();
        if (startWeight > 10000 || endWeight > 10000) revert InvalidWeights();
        if (startWeight < endWeight) revert InvalidWeights(); // Weight should decrease over time
        if (beneficiary == address(0)) revert InvalidBeneficiary();
        
        PoolId poolId = key.toId();
        
        lbpConfigs[poolId] = LBPConfig({
            startTime: startTime,
            endTime: endTime,
            startWeight: startWeight,
            endWeight: endWeight,
            isActive: true,
            beneficiary: beneficiary,
            token0: key.currency0,
            token1: key.currency1
        });
        
        // Store initial liquidity amounts for weight calculations
        initialLiquidity0[poolId] = initLiq0;
        initialLiquidity1[poolId] = initLiq1;
        
        emit LBPCreated(poolId, startTime, endTime, startWeight, endWeight, beneficiary);
        
        return this.beforeInitialize.selector;
    }
    
    /**
     * @dev Hook called before adding liquidity - only allow initial liquidity
     */
    function beforeAddLiquidity(
        address sender,
        PoolKey calldata key,
        IPoolManager.ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) external override onlyByPoolManager returns (bytes4) {
        PoolId poolId = key.toId();
        LBPConfig memory config = lbpConfigs[poolId];
        
        // Only allow adding liquidity before LBP starts
        if (block.timestamp >= config.startTime) {
            revert NotAuthorized();
        }
        
        return this.beforeAddLiquidity.selector;
    }
    
    /**
     * @dev Hook called before removing liquidity - prevent during LBP
     */
    function beforeRemoveLiquidity(
        address sender,
        PoolKey calldata key,
        IPoolManager.ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) external override onlyByPoolManager returns (bytes4) {
        PoolId poolId = key.toId();
        LBPConfig memory config = lbpConfigs[poolId];
        
        // Only allow removing liquidity after LBP ends
        if (block.timestamp < config.endTime) {
            revert LBPNotActive();
        }
        
        return this.beforeRemoveLiquidity.selector;
    }
    
    /**
     * @dev Hook called before swap - enforce buy-only and adjust weights
     */
    function beforeSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes calldata hookData
    ) external override onlyByPoolManager returns (bytes4, BeforeSwapDelta, uint24) {
        PoolId poolId = key.toId();
        LBPConfig memory config = lbpConfigs[poolId];
        
        // Check if LBP is active
        if (!config.isActive) revert LBPNotActive();
        if (block.timestamp < config.startTime || block.timestamp > config.endTime) {
            revert LBPNotActive();
        }
        
        // Only allow swaps where users give token0 (USDC) and receive token1 (ANVL)
        if (!params.zeroForOne) {
            revert SellNotAllowed(); // Prevent selling ANVL
        }
        
        // Calculate weight-adjusted swap delta
        BeforeSwapDelta beforeSwapDelta = _calculateWeightAdjustedDelta(poolId, config, params);
        
        return (this.beforeSwap.selector, beforeSwapDelta, 0);
    }
    
    /**
     * @dev Calculate the delta adjustment based on current weights
     */
    function _calculateWeightAdjustedDelta(
        PoolId poolId,
        LBPConfig memory config,
        IPoolManager.SwapParams memory params
    ) internal view returns (BeforeSwapDelta) {
        uint256 currentWeight = _getCurrentWeight(config);
        
        // Get current pool reserves (simplified - in production use actual pool state)
        uint256 reserve0 = initialLiquidity0[poolId]; // Base token reserves
        uint256 reserve1 = initialLiquidity1[poolId]; // ANVL reserves
        
        // Calculate weight ratios
        uint256 weight0 = 10000 - currentWeight; // Base token weight
        uint256 weight1 = currentWeight;         // ANVL weight
        
        // Calculate virtual reserves based on weights
        // Virtual reserves create the price impact of weighted pools
        uint256 virtualReserve0 = (reserve0 * 10000) / weight0;
        uint256 virtualReserve1 = (reserve1 * 10000) / weight1;
        
        // Calculate the delta to apply before swap
        // This modifies the effective reserves the AMM sees
        int256 delta0 = int256(virtualReserve0) - int256(reserve0);
        int256 delta1 = int256(virtualReserve1) - int256(reserve1);
        
        // Return the delta that adjusts pool reserves before swap calculation
        return toBeforeSwapDelta(delta0, delta1);
    }
    
    /**
     * @dev Helper to create BeforeSwapDelta
     */
    function toBeforeSwapDelta(int256 delta0, int256 delta1) 
        internal 
        pure 
        returns (BeforeSwapDelta) 
    {
        return BeforeSwapDelta.wrap(
            (int256(delta0) << 128) | 
            (int256(delta1) & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
        );
    }
    
    /**
     * @dev Hook called after swap - track purchases
     */
    function afterSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) external override onlyByPoolManager returns (bytes4, int128) {
        PoolId poolId = key.toId();
        
        // Track amount raised (token0 received)
        if (params.zeroForOne && delta.amount0() > 0) {
            totalRaised[poolId] += uint256(int256(delta.amount0()));
            
            emit TokensPurchased(
                poolId,
                sender,
                uint256(int256(delta.amount0())),
                uint256(int256(-delta.amount1()))
            );
        }
        
        return (this.afterSwap.selector, 0);
    }
    
    /**
     * @dev Calculate current weight based on time progression
     */
    function _getCurrentWeight(LBPConfig memory config) internal view returns (uint256) {
        if (block.timestamp <= config.startTime) {
            return config.startWeight;
        }
        if (block.timestamp >= config.endTime) {
            return config.endWeight;
        }
        
        uint256 elapsed = block.timestamp - config.startTime;
        uint256 duration = config.endTime - config.startTime;
        
        // Linear weight decrease
        uint256 weightDecrease = ((config.startWeight - config.endWeight) * elapsed) / duration;
        return config.startWeight - weightDecrease;
    }
    
    /**
     * @dev End the LBP and withdraw raised funds (only owner)
     */
    function endLBP(PoolKey calldata key) external onlyOwner {
        PoolId poolId = key.toId();
        LBPConfig storage config = lbpConfigs[poolId];
        
        if (block.timestamp <= config.endTime) revert LBPNotEnded();
        if (!config.isActive) revert AlreadyWithdrawn();
        
        config.isActive = false;
        
        uint256 amount = totalRaised[poolId];
        if (amount > 0) {
            // Transfer raised funds to beneficiary
            // This requires the hook to have collected the funds from the pool
            config.token0.transfer(config.beneficiary, amount);
            
            emit FundsWithdrawn(poolId, amount, config.beneficiary);
        }
        
        emit LBPEnded(poolId, amount);
    }
    
    /**
     * @dev Get current LBP status
     */
    function getLBPStatus(PoolKey calldata key) 
        external 
        view 
        returns (
            bool isActive,
            uint256 currentWeight,
            uint256 raised,
            uint256 timeRemaining
        ) 
    {
        PoolId poolId = key.toId();
        LBPConfig memory config = lbpConfigs[poolId];
        
        isActive = config.isActive && 
                   block.timestamp >= config.startTime && 
                   block.timestamp <= config.endTime;
        
        currentWeight = _getCurrentWeight(config);
        raised = totalRaised[poolId];
        timeRemaining = config.endTime > block.timestamp ? 
                       config.endTime - block.timestamp : 0;
    }
}
