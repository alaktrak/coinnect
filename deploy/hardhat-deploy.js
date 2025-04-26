// Dependencies Install:
// npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
// npm install @openzeppelin/contracts
//

// hardhat-deploy.js
async function main() {
    const [deployer] = await ethers.getSigners();

    const gMKTB = await ethers.getContractFactory("gMKTB");
    const gmktb = await gMKTB.deploy(ethers.utils.parseEther("1000000"));
    await gmktb.deployed();
    console.log(`gMKTB deployed to: ${trc.address}`);

    const mMKTB = await ethers.getContractFactory("mMKTB");
    const mmktb = await mMKTB.deploy(ethers.utils.parseEther("1000000"));
    await mmktb.deployed();
    console.log(`mMKTB deployed to: ${trc.address}`);

    const sMKTB = await ethers.getContractFactory("sMKTB");
    const smktb = await sMKTB.deploy(ethers.utils.parseEther("1000000"));
    await smktb.deployed();
    console.log(`sMKTB deployed to: ${trc.address}`);

    const dMKTB = await ethers.getContractFactory("dMKTB");
    const dmktb = await dMKTB.deploy(ethers.utils.parseEther("1000000"));
    await dmktb.deployed();
    console.log(`dMKTB deployed to: ${trc.address}`);
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
