const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Contracts", function () {
  let mCONCT, gCONCT;
  let mconct, gconct;
  let owner, treasuryWallet, otherAccount;

  beforeEach(async function () {
    [owner, treasuryWallet, otherAccount] = await ethers.getSigners();

    // Deploy mCONCT and gCONCT token contracts with correct constructor arguments
    mCONCT = await ethers.getContractFactory("mCONCT");
    gCONCT = await ethers.getContractFactory("gCONCT");

    // Fix: Use correct constructor parameters
    mconct = await mCONCT.deploy(owner.address, treasuryWallet.address);
    gconct = await gCONCT.deploy(owner.address);

    // No need for deployed() in ethers v6, deploy already waits for the contract
  });

  it("should have correct names and symbols", async function () {
    // Fix: Update to match the actual names in contracts
    expect(await mconct.name()).to.equal("Coinnect Transaction Token");
    expect(await mconct.symbol()).to.equal("mCONCT");

    expect(await gconct.name()).to.equal("Coinnect Governance Token");
    expect(await gconct.symbol()).to.equal("gCONCT");
  });

  it("should assign the initial supply to the owner", async function () {
    // Check that the initial supply is correctly assigned
    const initialSupply = await mconct.INITIAL_SUPPLY();
    const gconctMaxSupply = await gconct.MAX_SUPPLY();
    
    expect(await mconct.balanceOf(owner.address)).to.equal(initialSupply);
    expect(await gconct.balanceOf(owner.address)).to.equal(gconctMaxSupply);
  });

  it("should allow transfers between accounts", async function () {
    const amount = ethers.parseEther("1000");

    await mconct.transfer(otherAccount.address, amount);
    await gconct.transfer(otherAccount.address, amount);

    expect(await mconct.balanceOf(otherAccount.address)).to.equal(amount);
    expect(await gconct.balanceOf(otherAccount.address)).to.equal(amount);
  });

  it("should emit Transfer events", async function () {
    const amount = ethers.parseEther("1000");

    await expect(mconct.transfer(otherAccount.address, amount))
      .to.emit(mconct, "Transfer")
      .withArgs(owner.address, otherAccount.address, amount);
      
    await expect(gconct.transfer(otherAccount.address, amount))
      .to.emit(gconct, "Transfer")
      .withArgs(owner.address, otherAccount.address, amount);
  });

  // Only owner can mint, but the contracts don't have mint functions!
  // Let's test treasury release for mCONCT instead
  it("should allow owner to release treasury tokens", async function () {
    // We need to advance time to release tokens
    const releaseTime = 90 * 24 * 60 * 60; // 90 days in seconds
    
    // Increase EVM time
    await ethers.provider.send("evm_increaseTime", [releaseTime]);
    await ethers.provider.send("evm_mine");
    
    // Check releasable amount before release
    const releasableAmount = await mconct.availableToRelease();
    expect(releasableAmount).to.be.gt(0);
    
    // Get treasury wallet balance before release
    const treasuryBalanceBefore = await mconct.balanceOf(treasuryWallet.address);
    
    // Release tokens
    await mconct.releaseTreasuryTokens();
    
    // Check treasury balance after release - using BigInt for calculations
    const treasuryBalanceAfter = await mconct.balanceOf(treasuryWallet.address);
    
    // In ethers v6, we should use native BigInt operations instead of .add()
    expect(treasuryBalanceAfter).to.equal(treasuryBalanceBefore + releasableAmount);
  });
});

// Create separate describe for gas benchmarking
describe("Gas cost benchmarking", function () {
  let mconct, gconct;
  let owner, treasuryWallet, otherAccount;
  const GAS_PRICE_GWEI = 30;
  const ETH_PRICE_USD = 3000;

  // Helper functions
  const toEth = (gasUsed, gasPriceGwei) => {
    const gasPriceWei = BigInt(gasPriceGwei) * BigInt(10**9);
    return BigInt(gasUsed) * gasPriceWei;
  };

  const toUSD = (ethCostWei, ethPriceUSD) => {
    const ethCostEther = Number(ethCostWei) / 1e18;
    return (ethCostEther * ethPriceUSD).toFixed(2);
  };

  before(async function () {
    [owner, treasuryWallet, otherAccount] = await ethers.getSigners();

    // Deploy contracts fresh for gas testing
    const mCONCT = await ethers.getContractFactory("mCONCT");
    const gCONCT = await ethers.getContractFactory("gCONCT");

    mconct = await mCONCT.deploy(owner.address, treasuryWallet.address);
    gconct = await gCONCT.deploy(owner.address);
  });

  // Benchmark each operation
  async function benchmark(label, operation) {
    try {
      const tx = await operation();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed;
      
      const ethCost = toEth(gasUsed, GAS_PRICE_GWEI);
      const usdCost = toUSD(ethCost, ETH_PRICE_USD);

      console.log(`📊 ${label}`);
      console.log(`   Gas used: ${gasUsed.toString()}`);
      console.log(`   Cost in ETH: ${Number(ethCost) / 10**18} ETH`);
      console.log(`   Approx cost in USD: $${usdCost}`);
      
      return gasUsed;
    } catch (error) {
      console.error(`Error in ${label} benchmark:`, error.message);
      return 0;
    }
  }

  it("benchmarks transfers with ETH & USD cost", async function () {
    const transferAmount = ethers.parseEther("1000");

    await benchmark("Transfer mCONCT", async () => 
      await mconct.transfer(otherAccount.address, transferAmount)
    );
    
    await benchmark("Transfer gCONCT", async () => 
      await gconct.transfer(otherAccount.address, transferAmount)
    );
  });

  it("benchmarks treasury release for mCONCT", async function() {
    // Increase time by 90 days to enable a release
    const releaseTime = 90 * 24 * 60 * 60;
    await ethers.provider.send("evm_increaseTime", [releaseTime]);
    await ethers.provider.send("evm_mine");
    
    // Only test if there are tokens to release
    const releasable = await mconct.availableToRelease();
    if (releasable > 0n) {  // Use BigInt comparison
      await benchmark("Treasury Release mCONCT", async () => 
        await mconct.releaseTreasuryTokens()
      );
    } else {
      console.log("No tokens available to release for gas benchmark");
    }
  });
});