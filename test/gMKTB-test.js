// npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
// npm install @openzeppelin/contracts

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("gMKTB Token", function () {
  let gMKTB, gmktb, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    gMKTB = await ethers.getContractFactory("gMKTB");
    gmktb = await gMKTB.deploy(ethers.utils.parseEther("1000000")); // 1 million MKTB
    await trc.deployed();
  });

  it("should have correct name and symbol", async function () {
    expect(await gmktb.name()).to.equal("MrktBlks Gov Token");
    expect(await gmktb.symbol()).to.equal("gMKTB");
  });

  it("should assign the initial supply to the owner", async function () {
    const ownerBalance = await gmktb.balanceOf(owner.address);
    expect(ownerBalance).to.equal(await gmktb.totalSupply());
  });

  it("should allow owner to mint tokens", async function () {
    const amount = ethers.utils.parseEther("5000");
    await gmktb.mint(addr1.address, amount);
    expect(await trc.balanceOf(addr1.address)).to.equal(amount);
  });

  it("should not allow non-owner to mint tokens", async function () {
    const amount = ethers.utils.parseEther("5000");
    await expect(gmktb.connect(addr1).mint(addr1.address, amount)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should allow transfers between accounts", async function () {
    const amount = ethers.utils.parseEther("1000");
    await gmktb.transfer(addr1.address, amount);
    expect(await gmktb.balanceOf(addr1.address)).to.equal(amount);
  });

  it("should emit Transfer events", async function () {
    const amount = ethers.utils.parseEther("1000");
    await expect(gmktb.transfer(addr1.address, amount))
      .to.emit(gmktb, "Transfer")
      .withArgs(owner.address, addr1.address, amount);
  });
});
