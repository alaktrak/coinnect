// Script to deploy the mCONCT token
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Get deployer balance
  const deployerBalance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(deployerBalance.toString()), "ETH");
  
  // Deploy mCONCT token
  // Use deployer as initialOwner and treasuryWallet for testing
  // In production, you would use different addresses
  const mCONCT = await hre.ethers.getContractFactory("mCONCT");
  const token = await mCONCT.deploy(deployer.address, deployer.address);
  await token.deployed();
  
  console.log("mCONCT token deployed to:", token.address);
  console.log("Initial supply:", ethers.utils.formatEther(await token.totalSupply()), "mCONCT");
  
  return { tokenAddress: token.address };
}

// We export the main function for use in the combined deployment script if needed
module.exports = main;

// If this script is run directly, execute main
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}