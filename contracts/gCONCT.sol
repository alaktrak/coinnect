// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title gCONCT Token
 * @dev Governance token with a fixed supply of 20M
 * @custom:security-contact security@coinnect.example.com
 */
contract gCONCT is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 20_000_000 * 10**18; // 20M total supply with 18 decimals
    
    // Events
    event TokenBurned(address indexed burner, uint256 amount);
    
    /**
     * @dev Constructor sets the total supply
     * @param initialOwner Address of the initial owner (will receive all tokens)
     */
    constructor(address initialOwner) 
        ERC20("Coinnect Governance Token", "gCONCT")
        Ownable(initialOwner) 
    {
        require(initialOwner != address(0), "Owner cannot be zero address");
        _mint(initialOwner, MAX_SUPPLY);
    }
    
    /**
     * @dev Custom burn function to emit additional events
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokenBurned(msg.sender, amount);
    }
    
    /**
     * @dev Custom burnFrom function to emit additional events
     * @param account Account to burn from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokenBurned(account, amount);
    }
}
