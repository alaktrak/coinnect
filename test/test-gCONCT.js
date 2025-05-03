const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("gCONCT Token", function () {
  let gConctContract, gCONCT, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    gConctContract = await ethers.getContractFactory("gCONCT");

    gCONCT = await gConctContract.deploy(owner.address);

    await gCONCT.deployed(); // Ethers v5
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
    const expectedMaxSupply = ethers.utils.parseEther("20000000");
    expect(await gCONCT.MAX_SUPPLY()).to.equal(expectedMaxSupply);
  });

  it("should allow owner to burn tokens", async function () {
    const initialBalance = await gCONCT.balanceOf(owner.address);
    const burnAmount = ethers.utils.parseEther("1000");

    await expect(gCONCT.burn(burnAmount))
      .to.emit(gCONCT, "TokenBurned")
      .withArgs(owner.address, burnAmount);

    const finalBalance = await gCONCT.balanceOf(owner.address);
    expect(finalBalance).to.equal(initialBalance.sub(burnAmount)); // BigNumber subtraction
  });

  it("should allow transfers between accounts", async function () {
    const amount = ethers.utils.parseEther("1000");
    await gCONCT.transfer(addr1.address, amount);
    expect(await gCONCT.balanceOf(addr1.address)).to.equal(amount);
  });

  it("should emit Transfer events", async function () {
    const amount = ethers.utils.parseEther("1000");
    await expect(gCONCT.transfer(addr1.address, amount))
      .to.emit(gCONCT, "Transfer")
      .withArgs(owner.address, addr1.address, amount);
  });
});
