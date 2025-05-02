import { ethers } from "hardhat";

async function main() {
  const MCONCT = await ethers.getContractFactory("mCONCT");
  const token = await MCONCT.deploy();
  await token.waitForDeployment();

  console.log(`mCONCT deployed to: ${token.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


