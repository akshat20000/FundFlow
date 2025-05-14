const hre = require("hardhat");

async function main() {
  console.log("Deploying SimpleWallet contract...");

  const SimpleWallet = await hre.ethers.getContractFactory("SimpleWallet");
  const simpleWallet = await SimpleWallet.deploy();

  // Wait for the contract to be deployed
  await simpleWallet.waitForDeployment();

  // Get the contract address
  const address = await simpleWallet.getAddress();
  console.log("SimpleWallet deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 