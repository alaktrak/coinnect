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
  let dappazon, mCONCT, mconct;
  let deployer, buyer;

  beforeEach(async function () {
    [deployer, buyer] = await ethers.getSigners();

    // Deploy a mock ERC20 token with required constructor arguments
    mCONCT = await ethers.getContractFactory("mCONCT");
    mconct = await mCONCT.deploy(deployer.address, deployer.address);
    await mconct.deployed();

    // Deploy Dappazon with the mock token's address
    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy(mconct.address);
    await dappazon.deployed();
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
      // Find the List event directly
      const event = receipt.events.find(event => event.event === "List");
      expect(event).to.exist; // Using .exist instead of to.not.be.undefined
      expect(event.args.name).to.equal(NAME);
      expect(event.args.cost).to.equal(COST);
      expect(event.args.quantity).to.equal(STOCK);
    });
  });

  describe("Buying", function () {
    let transaction, receipt;

    beforeEach(async function () {
      // List the item
      transaction = await dappazon.connect(deployer).list(
        ID, 
        NAME, 
        CATEGORY, 
        IMAGE, 
        COST, 
        RATING, 
        STOCK
      );
      await transaction.wait();

      // Mint some tokens to the buyer
      await mconct.connect(deployer).transfer(buyer.address, COST);
      
      // Approve the Dappazon contract to spend tokens
      await mconct.connect(buyer).approve(dappazon.address, COST);
      
      // Buy the item
      transaction = await dappazon.connect(buyer).buy(ID);
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
      const result = await mconct.balanceOf(dappazon.address);
      expect(result).to.equal(COST);
    });

    it("Emits Buy Event", async function () {
      // Find the Buy event directly
      const event = receipt.events.find(event => event.event === "Buy");
      expect(event).to.exist; // Using .exist instead of to.not.be.undefined
      expect(event.args.buyer).to.equal(buyer.address);
      expect(event.args.orderID).to.equal(1);
      expect(event.args.itemID).to.equal(ID);
    });

    it("Updates the item stock", async function () {
      const item = await dappazon.items(ID);
      expect(item.stock).to.equal(STOCK - 1);
    });
  });

  describe("Withdrawing", function () {
    let balanceBefore, transaction, receipt;

    beforeEach(async function () {
      // List the item
      transaction = await dappazon.connect(deployer).list(
        ID, 
        NAME, 
        CATEGORY, 
        IMAGE, 
        COST, 
        RATING, 
        STOCK
      );
      await transaction.wait();

      // Mint some tokens to the buyer
      await mconct.connect(deployer).transfer(buyer.address, COST);
      
      // Approve the Dappazon contract to spend tokens
      await mconct.connect(buyer).approve(dappazon.address, COST);
      
      // Buy the item
      transaction = await dappazon.connect(buyer).buy(ID);
      await transaction.wait();

      // Get token balance before withdrawal
      balanceBefore = await mconct.balanceOf(deployer.address);

      // Withdraw tokens
      transaction = await dappazon.connect(deployer).withdraw();
      receipt = await transaction.wait();
    });

    it("Updates the owner token balance", async function () {
      const balanceAfter = await mconct.balanceOf(deployer.address);
      expect(balanceAfter).to.equal(balanceBefore.add(COST));
    });

    it("Updates the contract token balance", async function () {
      const result = await mconct.balanceOf(dappazon.address);
      expect(result).to.equal(0);
    });
  });
});