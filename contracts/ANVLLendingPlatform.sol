// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// Fixed-point math library for precise calculations
library FixedPointMath {
    uint256 constant WAD = 10**18;
    
    function mulWad(uint256 x, uint256 y) internal pure returns (uint256) {
        return (x * y) / WAD;
    }
    
    function divWad(uint256 x, uint256 y) internal pure returns (uint256) {
        return (x * WAD) / y;
    }
}

interface IANVLToken {
    function isAuthorized(address account) external view returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @title ANVLLendingPlatform
 * @dev Fixed version with proper oracle integration and arithmetic precision
 */
contract ANVLLendingPlatform is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using FixedPointMath for uint256;
    
    IANVLToken public immutable anvlToken;
    IERC20 public immutable usdcToken;
    
    // Oracle configuration
    AggregatorV3Interface public anvlPriceFeed;
    AggregatorV3Interface public usdcPriceFeed; // For normalization if needed
    uint256 public constant PRICE_STALENESS_THRESHOLD = 3600; // 1 hour
    uint256 public constant MIN_PRICE = 1e4; // Minimum price sanity check (0.01 USDC)
    
    // Collateral parameters
    uint256 public constant COLLATERAL_RATIO = 150; // 150% collateralization required
    uint256 public constant LIQUIDATION_THRESHOLD = 120; // Liquidate at 120%
    uint256 public constant LIQUIDATION_PENALTY = 10; // 10% penalty
    
    // Interest parameters
    uint256 public constant ANNUAL_INTEREST_RATE = 9; // 9% APR
    uint256 public constant FLAT_FEE = 50 * 10**6; // $50 USDC flat fee
    
    // Fee reserve for explicit fee tracking
    uint256 public feeReserve;
    
    struct DealerAccount {
        uint256 anvlCollateral;    // ANVL tokens deposited
        uint256 principalBorrowed; // USDC principal borrowed
        uint256 lastUpdateTime;    // Last interest update
        uint256 accruedInterest;   // Accrued interest
        bool isActive;             // Account active status
    }
    
    mapping(address => DealerAccount) public dealerAccounts;
    
    // Platform statistics (principal only)
    uint256 public totalCollateral;
    uint256 public totalPrincipalBorrowed;
    
    // Events
    event CollateralDeposited(address indexed dealer, uint256 amount);
    event LoanIssued(address indexed dealer, uint256 principal, uint256 flatFee);
    event LoanRepaid(address indexed dealer, uint256 principal, uint256 interest);
    event CollateralWithdrawn(address indexed dealer, uint256 amount);
    event AccountLiquidated(
        address indexed dealer, 
        address indexed liquidator, 
        uint256 debtRepaid,
        uint256 collateralSeized
    );
    event PriceOracleUpdated(address indexed oracle);
    event FeesWithdrawn(uint256 amount);
    
    error NotAuthorized();
    error InvalidAmount();
    error InsufficientCollateral();
    error NoDebtToLiquidate();
    error NotLiquidatable();
    error StalePrice();
    error InvalidPrice();
    error NoActiveAccount();
    
    modifier onlyAuthorized() {
        if (!anvlToken.isAuthorized(msg.sender)) revert NotAuthorized();
        _;
    }
    
    constructor(
        address _anvlToken, 
        address _usdcToken,
        address _anvlPriceFeed,
        address _usdcPriceFeed
    ) {
        anvlToken = IANVLToken(_anvlToken);
        usdcToken = IERC20(_usdcToken);
        anvlPriceFeed = AggregatorV3Interface(_anvlPriceFeed);
        usdcPriceFeed = AggregatorV3Interface(_usdcPriceFeed);
    }
    
    /**
     * @dev Update price oracle addresses (only owner)
     */
    function updatePriceOracle(address _anvlPriceFeed) external onlyOwner {
        anvlPriceFeed = AggregatorV3Interface(_anvlPriceFeed);
        emit PriceOracleUpdated(_anvlPriceFeed);
    }
    
    /**
     * @dev Deposit ANVL tokens as collateral
     */
    function depositCollateral(address dealer, uint256 amount) 
        external 
        nonReentrant 
    {
        if (amount == 0) revert InvalidAmount();
        if (!anvlToken.isAuthorized(dealer)) revert NotAuthorized();
        
        // Transfer ANVL tokens from caller (could be dealer or LBP Manager)
        anvlToken.transferFrom(msg.sender, address(this), amount);
        
        DealerAccount storage account = dealerAccounts[dealer];
        
        // Update interest before modifying collateral
        if (account.isActive) {
            _updateInterest(dealer);
        } else {
            account.isActive = true;
            account.lastUpdateTime = block.timestamp;
        }
        
        account.anvlCollateral += amount;
        totalCollateral += amount;
        
        emit CollateralDeposited(dealer, amount);
    }
    
    /**
     * @dev Borrow USDC against ANVL collateral
     */
    function borrow(uint256 amount) 
        external 
        onlyAuthorized 
        nonReentrant 
    {
        if (amount == 0) revert InvalidAmount();
        
        DealerAccount storage account = dealerAccounts[msg.sender];
        if (!account.isActive) revert NoActiveAccount();
        
        _updateInterest(msg.sender);
        
        // Get current ANVL price
        uint256 anvlPrice = getANVLPrice();
        
        // Calculate maximum borrowable amount using fixed-point math
        uint256 collateralValueInUsdc = account.anvlCollateral.mulWad(anvlPrice) / 10**12; // Convert to USDC decimals
        uint256 maxBorrow = (collateralValueInUsdc * 100) / COLLATERAL_RATIO;
        
        uint256 totalDebt = account.principalBorrowed + account.accruedInterest;
        uint256 newTotalDebt = totalDebt + amount + FLAT_FEE;
        
        if (newTotalDebt > maxBorrow) revert InsufficientCollateral();
        
        // Transfer USDC to dealer
        usdcToken.safeTransfer(msg.sender, amount);
        
        // Update account
        account.principalBorrowed += amount;
        account.accruedInterest += FLAT_FEE; // Add flat fee to interest
        totalPrincipalBorrowed += amount;
        feeReserve += FLAT_FEE; // Track fees explicitly
        
        emit LoanIssued(msg.sender, amount, FLAT_FEE);
    }
    
    /**
     * @dev Repay USDC loan
     */
    function repay(uint256 amount) 
        external 
        nonReentrant 
    {
        DealerAccount storage account = dealerAccounts[msg.sender];
        if (!account.isActive) revert NoActiveAccount();
        if (amount == 0) revert InvalidAmount();
        
        _updateInterest(msg.sender);
        
        uint256 totalDebt = account.principalBorrowed + account.accruedInterest;
        uint256 repayAmount = amount > totalDebt ? totalDebt : amount;
        
        // Transfer USDC from dealer
        usdcToken.safeTransferFrom(msg.sender, address(this), repayAmount);
        
        // Apply repayment (first to interest, then to principal)
        uint256 interestPaid = repayAmount > account.accruedInterest ? 
                               account.accruedInterest : repayAmount;
        uint256 principalPaid = repayAmount - interestPaid;
        
        account.accruedInterest -= interestPaid;
        account.principalBorrowed -= principalPaid;
        totalPrincipalBorrowed -= principalPaid;
        feeReserve += interestPaid; // Add paid interest to fee reserve
        
        // Clear accrued interest if loan fully repaid
        if (account.principalBorrowed == 0 && account.accruedInterest > 0) {
            feeReserve += account.accruedInterest;
            account.accruedInterest = 0;
        }
        
        emit LoanRepaid(msg.sender, principalPaid, interestPaid);
    }
    
    /**
     * @dev Withdraw ANVL collateral
     */
    function withdrawCollateral(uint256 amount) 
        external 
        onlyAuthorized 
        nonReentrant 
    {
        DealerAccount storage account = dealerAccounts[msg.sender];
        if (!account.isActive) revert NoActiveAccount();
        if (amount == 0 || amount > account.anvlCollateral) revert InvalidAmount();
        
        _updateInterest(msg.sender);
        
        // Check collateralization after withdrawal
        uint256 remainingCollateral = account.anvlCollateral - amount;
        uint256 totalDebt = account.principalBorrowed + account.accruedInterest;
        
        if (totalDebt > 0) {
            uint256 anvlPrice = getANVLPrice();
            uint256 remainingCollateralValue = remainingCollateral.mulWad(anvlPrice) / 10**12;
            uint256 requiredCollateralValue = (totalDebt * COLLATERAL_RATIO) / 100;
            
            if (remainingCollateralValue < requiredCollateralValue) {
                revert InsufficientCollateral();
            }
        }
        
        // Transfer ANVL tokens back
        IERC20(address(anvlToken)).safeTransfer(msg.sender, amount);
        
        account.anvlCollateral -= amount;
        totalCollateral -= amount;
        
        emit CollateralWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Liquidate undercollateralized position
     */
    function liquidate(address dealer) 
        external 
        nonReentrant 
    {
        DealerAccount storage account = dealerAccounts[dealer];
        if (!account.isActive) revert NoActiveAccount();
        
        _updateInterest(dealer);
        
        uint256 totalDebt = account.principalBorrowed + account.accruedInterest;
        if (totalDebt == 0) revert NoDebtToLiquidate();
        
        // Check if position is undercollateralized
        uint256 anvlPrice = getANVLPrice();
        uint256 collateralValue = account.anvlCollateral.mulWad(anvlPrice) / 10**12;
        uint256 collateralRatio = (collateralValue * 100) / totalDebt;
        
        if (collateralRatio >= LIQUIDATION_THRESHOLD) revert NotLiquidatable();
        
        // Calculate liquidation amounts
        uint256 debtWithPenalty = totalDebt + (totalDebt * LIQUIDATION_PENALTY / 100);
        uint256 collateralToSeize = debtWithPenalty.divWad(anvlPrice) * 10**12;
        
        if (collateralToSeize > account.anvlCollateral) {
            collateralToSeize = account.anvlCollateral;
        }
        
        // Transfer USDC from liquidator
        usdcToken.safeTransferFrom(msg.sender, address(this), totalDebt);
        
        // Transfer collateral to liquidator
        IERC20(address(anvlToken)).safeTransfer(msg.sender, collateralToSeize);
        
        // Update account and global state
        uint256 principalCleared = account.principalBorrowed;
        uint256 interestCleared = account.accruedInterest;
        
        account.anvlCollateral -= collateralToSeize;
        account.principalBorrowed = 0;
        account.accruedInterest = 0;
        
        totalCollateral -= collateralToSeize;
        totalPrincipalBorrowed -= principalCleared;
        feeReserve += interestCleared; // Add cleared interest to fee reserve
        
        emit AccountLiquidated(dealer, msg.sender, totalDebt, collateralToSeize);
    }
    
    /**
     * @dev Update accrued interest for an account
     */
    function _updateInterest(address dealer) internal {
        DealerAccount storage account = dealerAccounts[dealer];
        
        if (account.principalBorrowed == 0) {
            account.lastUpdateTime = block.timestamp;
            return;
        }
        
        uint256 timeElapsed = block.timestamp - account.lastUpdateTime;
        if (timeElapsed == 0) return;
        
        // Calculate interest using fixed-point math to maintain precision
        uint256 annualInterest = account.principalBorrowed * ANNUAL_INTEREST_RATE / 100;
        uint256 interest = (annualInterest * timeElapsed) / 365 days;
        
        account.accruedInterest += interest;
        account.lastUpdateTime = block.timestamp;
    }
    
    /**
     * @dev Get current ANVL price from Chainlink oracle
     */
    function getANVLPrice() public view returns (uint256) {
        (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = anvlPriceFeed.latestRoundData();
        
        // Validate price data
        if (updatedAt == 0 || block.timestamp - updatedAt > PRICE_STALENESS_THRESHOLD) {
            revert StalePrice();
        }
        
        if (price <= int256(MIN_PRICE)) {
            revert InvalidPrice();
        }
        
        // Return price scaled to 18 decimals
        return uint256(price) * 10**10; // Chainlink uses 8 decimals, scale to 18
    }
    
    /**
     * @dev Get account details with current calculations
     */
    function getAccountInfo(address dealer) 
        external 
        view 
        returns (
            uint256 collateral,
            uint256 borrowed,
            uint256 interest,
            uint256 collateralRatio,
            bool isLiquidatable
        ) 
    {
        DealerAccount memory account = dealerAccounts[dealer];
        
        if (!account.isActive) {
            return (0, 0, 0, 0, false);
        }
        
        // Calculate current interest
        uint256 timeElapsed = block.timestamp - account.lastUpdateTime;
        uint256 currentInterest = account.accruedInterest;
        
        if (account.principalBorrowed > 0 && timeElapsed > 0) {
            uint256 annualInterest = account.principalBorrowed * ANNUAL_INTEREST_RATE / 100;
            currentInterest += (annualInterest * timeElapsed) / 365 days;
        }
        
        uint256 totalDebt = account.principalBorrowed + currentInterest;
        uint256 ratio = 0;
        bool liquidatable = false;
        
        if (totalDebt > 0) {
            try this.getANVLPrice() returns (uint256 price) {
                uint256 collateralValue = account.anvlCollateral.mulWad(price) / 10**12;
                ratio = (collateralValue * 100) / totalDebt;
                liquidatable = ratio < LIQUIDATION_THRESHOLD;
            } catch {
                // If price oracle fails, return 0 ratio and not liquidatable
                ratio = 0;
                liquidatable = false;
            }
        }
        
        return (
            account.anvlCollateral,
            account.principalBorrowed,
            currentInterest,
            ratio,
            liquidatable
        );
    }
    
    /**
     * @dev Withdraw platform fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        uint256 availableFees = feeReserve;
        if (availableFees > 0) {
            feeReserve = 0;
            usdcToken.safeTransfer(owner(), availableFees);
            emit FeesWithdrawn(availableFees);
        }
    }
}
