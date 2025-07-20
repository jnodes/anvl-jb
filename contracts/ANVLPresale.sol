// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ANVLPresale is Ownable(msg.sender), Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable anvlToken;
    IERC20 public immutable usdcToken;
    
    uint256 public constant ANVL_PRICE = 20; // $0.20 per ANVL (in cents)
    uint256 public constant MIN_PURCHASE = 1000 * 10**6; // $1,000 minimum in USDC (6 decimals)
    uint256 public constant MAX_PURCHASE = 100000 * 10**6; // $100,000 maximum in USDC
    
    uint256 public totalRaised;
    uint256 public totalSold;
    uint256 public presaleCap = 10_000_000 * 10**6; // $10M cap in USDC
    
    mapping(address => uint256) public purchases; // Track USDC spent per address
    mapping(address => bool) public hasClaimed;
    
    bool public claimEnabled = false;
    
    event TokensPurchased(address indexed buyer, uint256 usdcAmount, uint256 anvlAmount);
    event TokensClaimed(address indexed buyer, uint256 amount);
    event PresaleCapUpdated(uint256 newCap);
    event ClaimEnabledUpdated(bool enabled);
    
    constructor(address _anvlToken, address _usdcToken) {
        anvlToken = IERC20(_anvlToken);
        usdcToken = IERC20(_usdcToken);
    }
    
    function buyTokens(uint256 usdcAmount) external whenNotPaused nonReentrant {
        require(usdcAmount >= MIN_PURCHASE, "Below minimum purchase");
        require(purchases[msg.sender] + usdcAmount <= MAX_PURCHASE, "Exceeds maximum purchase");
        require(totalRaised + usdcAmount <= presaleCap, "Exceeds presale cap");
        
        // Calculate ANVL amount (USDC has 6 decimals, ANVL has 18)
        // Price: $0.20 per ANVL = 20 cents
        // usdcAmount (6 decimals) * 100 / 20 = anvlAmount (before decimal adjustment)
        uint256 anvlAmount = (usdcAmount * 10**12 * 100) / ANVL_PRICE;
        
        // Transfer USDC from buyer
        usdcToken.safeTransferFrom(msg.sender, address(this), usdcAmount);
        
        // Update state
        purchases[msg.sender] += usdcAmount;
        totalRaised += usdcAmount;
        totalSold += anvlAmount;
        
        emit TokensPurchased(msg.sender, usdcAmount, anvlAmount);
    }
    
    function claimTokens() external nonReentrant {
        require(claimEnabled, "Claiming not enabled yet");
        require(purchases[msg.sender] > 0, "No tokens to claim");
        require(!hasClaimed[msg.sender], "Already claimed");
        
        uint256 anvlAmount = (purchases[msg.sender] * 10**12 * 100) / ANVL_PRICE;
        hasClaimed[msg.sender] = true;
        
        anvlToken.safeTransfer(msg.sender, anvlAmount);
        
        emit TokensClaimed(msg.sender, anvlAmount);
    }
    
    // Admin functions
    function setPresaleCap(uint256 newCap) external onlyOwner {
        presaleCap = newCap;
        emit PresaleCapUpdated(newCap);
    }
    
    function enableClaim(bool _enabled) external onlyOwner {
        claimEnabled = _enabled;
        emit ClaimEnabledUpdated(_enabled);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function withdrawUSDC() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        usdcToken.safeTransfer(owner(), balance);
    }
    
    function emergencyWithdrawTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
    
    // View functions
    function getUserPurchase(address user) external view returns (uint256 usdcSpent, uint256 anvlClaimable, bool claimed) {
        usdcSpent = purchases[user];
        anvlClaimable = (usdcSpent * 10**12 * 100) / ANVL_PRICE;
        claimed = hasClaimed[user];
    }
}
