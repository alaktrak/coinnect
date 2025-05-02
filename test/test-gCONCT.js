// npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
// npm install @openzeppelin/contracts

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("gCONCT Token", function () {
  let gConctContract, gCONCT, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Get the contract factory
    gConctContract = await ethers.getContractFactory("gCONCT");
    
    // Deploy with owner's address as initialOwner parameter
    gCONCT = await gConctContract.deploy(owner.address);
    
    // Wait for deployment
    await gCONCT.waitForDeployment();
  });

  it("should have correct name and symbol", async function () {
    expect(await gCONCT.name()).to.equal("Coinnect Governance Token");
    expect(await gCONCT.symbol()).to.equal("gCONCT");
  });

  it("should assign the initial supply to the owner", async function () {
    const ownerBalance = await gCONCT.balanceOf(owner.address);
    expect(ownerBalance).to.equal(await gCONCT.totalSupply());
  });

  it("should have correct MAX_SUPPLY", async function () {
    const expectedMaxSupply = ethers.parseEther("20000000"); // 20M tokens with 18 decimals
    expect(await gCONCT.MAX_SUPPLY()).to.equal(expectedMaxSupply);
  });

  it("should allow owner to burn tokens", async function () {
    const initialBalance = await gCONCT.balanceOf(owner.address);
    const burnAmount = ethers.parseEther("1000");
    
    await expect(gCONCT.burn(burnAmount))
      .to.emit(gCONCT, "TokenBurned")
      .withArgs(owner.address, burnAmount);
      
    const finalBalance = await gCONCT.balanceOf(owner.address);
    expect(finalBalance).to.equal(initialBalance - burnAmount);
  });

  it("should allow transfers between accounts", async function () {
    const amount = ethers.parseEther("1000");
    await gCONCT.transfer(addr1.address, amount);
    expect(await gCONCT.balanceOf(addr1.address)).to.equal(amount);
  });

  it("should emit Transfer events", async function () {
    const amount = ethers.parseEther("1000");
    await expect(gCONCT.transfer(addr1.address, amount))
      .to.emit(gCONCT, "Transfer")
      .withArgs(owner.address, addr1.address, amount);
  });
});