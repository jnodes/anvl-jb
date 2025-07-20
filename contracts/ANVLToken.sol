// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ANVLToken is ERC20, ERC20Burnable, Ownable(msg.sender) {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    constructor() ERC20("ANVL Token", "ANVL") {
        _mint(msg.sender, TOTAL_SUPPLY);
    }
}
