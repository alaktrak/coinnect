const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether'); // Ethers v5
};

// Global constraints
const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Clothing";
const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg";
const COST = tokens(1);
const RATING = 4;
const STOCK = 5;

describe("Dappazon", function () {
  let dappazon;
  let deployer, buyer;

  beforeEach(async function () {
    [deployer, buyer] = await ethers.getSigners();

    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy();
    await dappazon.deployed(); // Ethers v5
  });

  describe("Deployment", function () {
    it("Sets the owner", async function () {
      expect(await dappazon.owner()).to.equal(deployer.address);
    });
  });

  describe("Listing", function () {
    let transaction, receipt;

    beforeEach(async function () {
      transaction = await dappazon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      );
      receipt = await transaction.wait();
    });

    it("Returns item attributes", async function () {
      const item = await dappazon.items(ID);
      expect(item.id).to.equal(ID);
      expect(item.name).to.equal(NAME);
      expect(item.category).to.equal(CATEGORY);
      expect(item.image).to.equal(IMAGE);
      expect(item.cost).to.equal(COST);
      expect(item.rating).to.equal(RATING);
      expect(item.stock).to.equal(STOCK);
    });

    it("Emits List Event", async function () {
      const logs = receipt.logs.map(log => dappazon.interface.parseLog(log));
      const listEvent = logs.find(log => log.name === "List");
      expect(listEvent).to.not.be.undefined;
      expect(listEvent.args.name).to.equal(NAME);
    });
  });

  describe("Buying", function () {
    let transaction, receipt;

    beforeEach(async function () {
      transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();

      transaction = await dappazon.connect(buyer).buy(ID, { value: COST });
      receipt = await transaction.wait();
    });

    it("Updates Buyer's Order Count", async function () {
      const result = await dappazon.orderCount(buyer.address);
      expect(result).to.equal(1);
    });

    it("Adds the Order", async function () {
      const order = await dappazon.orders(buyer.address, 1);
      expect(order.time).to.be.gt(0);
      expect(order.item.name).to.equal(NAME);
    });

    it("Updates the Contract Balance", async function () {
      const result = await ethers.provider.getBalance(dappazon.address); // Ethers v5
      expect(result).to.equal(COST);
    });

    it("Emits Buy Event", async function () {
      const logs = receipt.logs.map(log => dappazon.interface.parseLog(log));
      const buyEvent = logs.find(log => log.name === "Buy");
      expect(buyEvent).to.not.be.undefined;
      expect(buyEvent.args.buyer).to.equal(buyer.address);
      expect(buyEvent.args.itemID).to.equal(ID);
    });
  });

  describe("Withdrawing", function () {
    let balanceBefore, transaction, receipt;

    beforeEach(async function () {
      transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();

      transaction = await dappazon.connect(buyer).buy(ID, { value: COST });
      await transaction.wait();

      balanceBefore = await ethers.provider.getBalance(deployer.address);

      transaction = await dappazon.connect(deployer).withdraw();
      receipt = await transaction.wait();
    });

    it("Updates the owner balance", async function () {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Updates the contract balance", async function () {
      const result = await ethers.provider.getBalance(dappazon.address); // Ethers v5
      expect(result).to.equal(ethers.constants.Zero);
    });
  });
});
