// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { items } = require("../src/items.json");
const deployToken = require("./deploy-mCONCT.js");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // First deploy the mCONCT token
  console.log("Deploying mCONCT token...");
  const { tokenAddress } = await deployToken();
  
  // Get the mCONCT contract instance
  const mCONCT = await ethers.getContractAt("mCONCT", tokenAddress);
  
  // Deploy Dappazon with mCONCT token address
  console.log("Deploying Dappazon marketplace...");
  const Dappazon = await hre.ethers.getContractFactory("Dappazon");
  const dappazon = await Dappazon.deploy(tokenAddress);
  await dappazon.deployed();

  console.log(`Deployed Dappazon Contract at: ${dappazon.address}\n`);
  
  // Approve Dappazon to spend tokens from user accounts for testing
  // In production, users would need to approve individually
  const approvalAmount = ethers.utils.parseUnits("1000000", 'ether'); // Large approval for testing
  await mCONCT.approve(dappazon.address, approvalAmount);
  console.log(`Approved Dappazon to spend ${ethers.utils.formatEther(approvalAmount)} mCONCT tokens\n`);

  // List Items
  for (let i = 0; i < items.length; i++) { 
    const transaction = await dappazon.connect(deployer).list(
      items[i].id,
      items[i].name,
      items[i].category,
      items[i].image,
      tokens(items[i].price),
      items[i].rating,
      items[i].stock
    );
    await transaction.wait();

    console.log(`Listed item ${items[i].id}: ${items[i].name}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
