const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Contracts", function () {
  let TRC, STRC, DTRC, MTRC;
  let trc, strc, dtrc, mtrc;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy all token contracts
    TRC = await ethers.getContractFactory("TRC");
    STRC = await ethers.getContractFactory("STRC");
    DTRC = await ethers.getContractFactory("DTRC");
    MTRC = await ethers.getContractFactory("MTRC");

    trc = await TRC.deploy(ethers.utils.parseEther("1000000"));
    strc = await STRC.deploy(ethers.utils.parseEther("1000000"));
    dtrc = await DTRC.deploy(ethers.utils.parseEther("1000000"));
    mtrc = await MTRC.deploy(ethers.utils.parseEther("1000000"));

    await trc.deployed();
    await strc.deployed();
    await dtrc.deployed();
    await mtrc.deployed();
  });

  it("should have correct names and symbols", async function () {
    expect(await trc.name()).to.equal("TriArc Token");
    expect(await trc.symbol()).to.equal("TRC");

    expect(await strc.name()).to.equal("Storage Token");
    expect(await strc.symbol()).to.equal("sTRC");

    expect(await dtrc.name()).to.equal("DeFi Token");
    expect(await dtrc.symbol()).to.equal("dTRC");

    expect(await mtrc.name()).to.equal("Marketplace Token");
    expect(await mtrc.symbol()).to.equal("mTRC");
  });

  it("should assign the initial supply to the owner", async function () {
    expect(await trc.balanceOf(owner.address)).to.equal(await trc.totalSupply());
    expect(await strc.balanceOf(owner.address)).to.equal(await strc.totalSupply());
    expect(await dtrc.balanceOf(owner.address)).to.equal(await dtrc.totalSupply());
    expect(await mtrc.balanceOf(owner.address)).to.equal(await mtrc.totalSupply());
  });

  it("should allow owner to mint tokens", async function () {
    const amount = ethers.utils.parseEther("5000");

    await trc.mint(addr1.address, amount);
    await strc.mint(addr1.address, amount);
    await dtrc.mint(addr1.address, amount);
    await mtrc.mint(addr1.address, amount);

    expect(await trc.balanceOf(addr1.address)).to.equal(amount);
    expect(await strc.balanceOf(addr1.address)).to.equal(amount);
    expect(await dtrc.balanceOf(addr1.address)).to.equal(amount);
    expect(await mtrc.balanceOf(addr1.address)).to.equal(amount);
  });

  it("should allow transfers between accounts", async function () {
    const amount = ethers.utils.parseEther("1000");

    await trc.transfer(addr1.address, amount);
    await strc.transfer(addr1.address, amount);
    await dtrc.transfer(addr1.address, amount);
    await mtrc.transfer(addr1.address, amount);

    expect(await trc.balanceOf(addr1.address)).to.equal(amount);
    expect(await strc.balanceOf(addr1.address)).to.equal(amount);
    expect(await dtrc.balanceOf(addr1.address)).to.equal(amount);
    expect(await mtrc.balanceOf(addr1.address)).to.equal(amount);
  });

  it("should emit Transfer events", async function () {
    const amount = ethers.utils.parseEther("1000");

    await expect(trc.transfer(addr1.address, amount))
      .to.emit(trc, "Transfer")
      .withArgs(owner.address, addr1.address, amount);
    await expect(strc.transfer(addr1.address, amount))
      .to.emit(strc, "Transfer")
      .withArgs(owner.address, addr1.address, amount);
    await expect(dtrc.transfer(addr1.address, amount))
      .to.emit(dtrc, "Transfer")
      .withArgs(owner.address, addr1.address, amount);
    await expect(mtrc.transfer(addr1.address, amount))
      .to.emit(mtrc, "Transfer")
      .withArgs(owner.address, addr1.address, amount);
  });

  // Gas cost benchmarking for mint and transfer
  it("should benchmark gas costs for minting", async function () {
    const amount = ethers.utils.parseEther("5000");

    const mintTRCGas = await trc.estimateGas.mint(addr1.address, amount);
    const mintSTRCGas = await strc.estimateGas.mint(addr1.address, amount);
    const mintDTRCGas = await dtrc.estimateGas.mint(addr1.address, amount);
    const mintMTRCGas = await mtrc.estimateGas.mint(addr1.address, amount);

    console.log(`Gas cost for minting TRC: ${mintTRCGas.toString()}`);
    console.log(`Gas cost for minting sTRC: ${mintSTRCGas.toString()}`);
    console.log(`Gas cost for minting dTRC: ${mintDTRCGas.toString()}`);
    console.log(`Gas cost for minting mTRC: ${mintMTRCGas.toString()}`);
  });

  it("should benchmark gas costs for transfers", async function () {
    const amount = ethers.utils.parseEther("1000");

    const transferTRCGas = await trc.estimateGas.transfer(addr1.address, amount);
    const transferSTRCGas = await strc.estimateGas.transfer(addr1.address, amount);
    const transferDTRCGas = await dtrc.estimateGas.transfer(addr1.address, amount);
    const transferMTRCGas = await mtrc.estimateGas.transfer(addr1.address, amount);

    console.log(`Gas cost for transferring TRC: ${transferTRCGas.toString()}`);
    console.log(`Gas cost for transferring sTRC: ${transferSTRCGas.toString()}`);
    console.log(`Gas cost for transferring dTRC: ${transferDTRCGas.toString()}`);
    console.log(`Gas cost for transferring mTRC: ${transferMTRCGas.toString()}`);
  });
});

const { ethers } = require("hardhat");

const toEth = (gasUsed, gasPriceGwei) => {
  const gasPrice = ethers.utils.parseUnits(gasPriceGwei.toString(), "gwei");
  return gasUsed.mul(gasPrice);
};

const toUSD = (ethCost, ethPriceUSD) => {
  const ethAsFloat = parseFloat(ethers.utils.formatEther(ethCost));
  return (ethAsFloat * ethPriceUSD).toFixed(2);
};

describe("Gas cost benchmarking", function () {
  const GAS_PRICE_GWEI = 30;
  const ETH_PRICE_USD = 3000;

  // Benchmark each variant
  async function benchmark(label, contract, operation) {
    const gasUsed = await operation.estimateGas();
    const ethCost = toEth(gasUsed, GAS_PRICE_GWEI);
    const usdCost = toUSD(ethCost, ETH_PRICE_USD);

    console.log(`📊 ${label}`);
    console.log(`   Gas used: ${gasUsed.toString()}`);
    console.log(`   Cost in ETH: ${ethers.utils.formatEther(ethCost)} ETH`);
    console.log(`   Approx cost in USD: $${usdCost}`);
  }

  it("benchmarks minting and transfers with ETH & USD cost", async function () {
    const amount = ethers.utils.parseEther("5000");
    const transferAmount = ethers.utils.parseEther("1000");

    await benchmark("Mint TRC", trc, () => trc.mint(addr1.address, amount));
    await benchmark("Mint sTRC", strc, () => strc.mint(addr1.address, amount));
    await benchmark("Mint dTRC", dtrc, () => dtrc.mint(addr1.address, amount));
    await benchmark("Mint mTRC", mtrc, () => mtrc.mint(addr1.address, amount));

    await benchmark("Transfer TRC", trc, () => trc.transfer(addr2.address, transferAmount));
    await benchmark("Transfer sTRC", strc, () => strc.transfer(addr2.address, transferAmount));
    await benchmark("Transfer dTRC", dtrc, () => dtrc.transfer(addr2.address, transferAmount));
    await benchmark("Transfer mTRC", mtrc, () => mtrc.transfer(addr2.address, transferAmount));
  });
});
