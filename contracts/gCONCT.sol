// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title gCONCT Token
 * @dev Governance token with a fixed supply of 20M
 */
contract gCONCT is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 20_000_000 * 10**18; // 20M total supply with 18 decimals
    
    /**
     * @dev Constructor sets the total supply
     * @param initialOwner Address of the initial owner (will receive all tokens)
     */
    constructor(address initialOwner) 
        ERC20("Coinnect Governance Token", "gCONCT")
        Ownable(initialOwner) 
    {
        _mint(initialOwner, MAX_SUPPLY);
    }
}
