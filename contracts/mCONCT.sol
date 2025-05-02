// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title mCONCT Token
 * @dev ERC20 token for marketplace transactions with initial 30M supply and quarterly releases
 */
contract MCONCT is ERC20, ERC20Burnable, Ownable {
    uint256 public constant INITIAL_SUPPLY = 30_000_000 * 10**18; // 30M tokens with 18 decimals
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100M max supply
    uint256 public constant TREASURY_SUPPLY = 70_000_000 * 10**18; // 70M reserved for treasury
    
    uint256 public treasuryReleaseStartTime;
    uint256 public constant RELEASE_PERIOD = 90 days; // Quarterly release schedule
    uint256 public constant RELEASE_DURATION = 4 * 365 days; // 4 years of releases
    uint256 public constant RELEASES_COUNT = 16; // 16 quarterly releases over 4 years
    uint256 public constant RELEASE_AMOUNT = TREASURY_SUPPLY / RELEASES_COUNT; // Amount per release
    
    uint256 public releasedSupply;
    address public treasuryWallet;
    
    /**
     * @dev Constructor sets initial supply and reserves treasury tokens
     * @param initialOwner Address of the initial owner
     * @param _treasuryWallet Address of the treasury wallet 
     */
    constructor(address initialOwner, address _treasuryWallet) 
        ERC20("Coinnect Transaction Token", "mCONCT") 
        Ownable(initialOwner) 
    {
        require(_treasuryWallet != address(0), "Treasury wallet cannot be zero address");
        treasuryWallet = _treasuryWallet;
        
        // Mint initial supply to contract owner
        _mint(initialOwner, INITIAL_SUPPLY);
        
        // Set release start time
        treasuryReleaseStartTime = block.timestamp;
        releasedSupply = INITIAL_SUPPLY;
    }
    
    /**
     * @dev Returns available treasury tokens that can be released based on time elapsed
     */
    function availableToRelease() public view returns (uint256) {
        if (block.timestamp < treasuryReleaseStartTime) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - treasuryReleaseStartTime;
        
        if (timeElapsed >= RELEASE_DURATION) {
            return TREASURY_SUPPLY - (releasedSupply - INITIAL_SUPPLY);
        }
        
        uint256 releasePeriodsPassed = timeElapsed / RELEASE_PERIOD;
        uint256 totalShouldBeReleased = INITIAL_SUPPLY + (releasePeriodsPassed * RELEASE_AMOUNT);
        
        // Cap at max supply
        totalShouldBeReleased = Math.min(totalShouldBeReleased, MAX_SUPPLY);
        
        // Calculate what can actually be released now
        return totalShouldBeReleased - releasedSupply;
    }
    
    /**
     * @dev Releases available treasury tokens to the treasury wallet
     */
    function releaseTreasuryTokens() external onlyOwner {
        uint256 releaseAmount = availableToRelease();
        require(releaseAmount > 0, "No tokens available for release");
        
        releasedSupply += releaseAmount;
        _mint(treasuryWallet, releaseAmount);
        
        // Ensure we never exceed max supply
        assert(releasedSupply <= MAX_SUPPLY);
    }
    
    /**
     * @dev Updates the treasury wallet address
     * @param newTreasuryWallet Address of the new treasury wallet
     */
    function setTreasuryWallet(address newTreasuryWallet) external onlyOwner {
        require(newTreasuryWallet != address(0), "Treasury wallet cannot be zero address");
        treasuryWallet = newTreasuryWallet;
    }
}

