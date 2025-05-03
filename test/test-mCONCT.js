const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("mCONCT", function () {
  let mConctContract, token, owner, treasuryWallet, addr1;

  beforeEach(async function () {
    [owner, treasuryWallet, addr1] = await ethers.getSigners();
    
    mConctContract = await ethers.getContractFactory("mCONCT");
    
    token = await mConctContract.deploy(owner.address, treasuryWallet.address);
    
    await token.deployed(); // Ethers v5 compatible
  });

  it("Should have correct name and symbol", async function () {
    expect(await token.name()).to.equal("Coinnect Transaction Token");
    expect(await token.symbol()).to.equal("mCONCT");
  });

  it("Should assign initial supply to owner", async function () {
    const initialSupply = ethers.utils.parseEther("30000000"); // 30M tokens
    expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
  });

  it("Should set treasury wallet correctly", async function () {
    expect(await token.treasuryWallet()).to.equal(treasuryWallet.address);
  });

  it("Should have correct constants", async function () {
    expect(await token.INITIAL_SUPPLY()).to.equal(ethers.utils.parseEther("30000000"));
    expect(await token.MAX_SUPPLY()).to.equal(ethers.utils.parseEther("100000000"));
    expect(await token.TREASURY_SUPPLY()).to.equal(ethers.utils.parseEther("70000000"));
  });

  it("Should allow owner to update treasury wallet", async function () {
    await expect(token.setTreasuryWallet(addr1.address))
      .to.emit(token, "TreasuryWalletUpdated")
      .withArgs(treasuryWallet.address, addr1.address);
      
    expect(await token.treasuryWallet()).to.equal(addr1.address);
  });

  it("Should calculate available tokens to release", async function () {
    // Initially there should be 0 tokens available as no time has passed
    expect(await token.availableToRelease()).to.equal(0);
  });
});
