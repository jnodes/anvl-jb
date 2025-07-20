// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ANVLToken
 * @dev ERC20 token for the ANVL floor plan financing platform
 * Used as governance and reward token within the ecosystem
 */
contract ANVLToken is ERC20, ERC20Burnable, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    // Token allocation
    uint256 public constant LIQUIDITY_ALLOCATION = 200_000_000 * 10**18; // 20% for liquidity
    uint256 public constant REWARDS_ALLOCATION = 300_000_000 * 10**18; // 30% for rewards
    uint256 public constant TEAM_ALLOCATION = 150_000_000 * 10**18; // 15% for team
    uint256 public constant TREASURY_ALLOCATION = 350_000_000 * 10**18; // 35% for treasury
    
    address public liquidityPool;
    address public rewardsPool;
    address public teamWallet;
    address public treasury;
    
    mapping(address => bool) public authorized;
    
    event AuthorizationUpdated(address indexed account, bool authorized);
    event PoolAddressesSet(
        address liquidityPool,
        address rewardsPool,
        address teamWallet,
        address treasury
    );
    
    constructor() ERC20("ANVL Token", "ANVL") {
        // Initial mint to deployer for distribution
        _mint(msg.sender, MAX_SUPPLY);
    }
    
    /**
     * @dev Set the addresses for token distribution
     * Can only be called once by owner
     */
    function setPoolAddresses(
        address _liquidityPool,
        address _rewardsPool,
        address _teamWallet,
        address _treasury
    ) external onlyOwner {
        require(liquidityPool == address(0), "Addresses already set");
        require(
            _liquidityPool != address(0) &&
            _rewardsPool != address(0) &&
            _teamWallet != address(0) &&
            _treasury != address(0),
            "Invalid address"
        );
        
        liquidityPool = _liquidityPool;
        rewardsPool = _rewardsPool;
        teamWallet = _teamWallet;
        treasury = _treasury;
        
        // Transfer allocated tokens
        _transfer(msg.sender, liquidityPool, LIQUIDITY_ALLOCATION);
        _transfer(msg.sender, rewardsPool, REWARDS_ALLOCATION);
        _transfer(msg.sender, teamWallet, TEAM_ALLOCATION);
        _transfer(msg.sender, treasury, TREASURY_ALLOCATION);
        
        emit PoolAddressesSet(_liquidityPool, _rewardsPool, _teamWallet, _treasury);
    }
    
    /**
     * @dev Authorize an address to interact with the lending platform
     */
    function setAuthorization(address account, bool _authorized) external onlyOwner {
        authorized[account] = _authorized;
        emit AuthorizationUpdated(account, _authorized);
    }
    
    /**
     * @dev Check if an address is authorized
     */
    function isAuthorized(address account) external view returns (bool) {
        return authorized[account];
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to check pause status
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Paste your ANVLToken contract here
// This is a placeholder file
