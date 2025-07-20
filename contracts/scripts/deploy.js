const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting ANVL deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);
  console.log("-----------------------------------\n");

  // Deploy ANVL Token
  console.log("1. Deploying ANVL Token...");
  const ANVLToken = await hre.ethers.getContractFactory("ANVLToken");
  const anvlToken = await ANVLToken.deploy();
  await anvlToken.deployed();
  console.log("✅ ANVL Token deployed to:", anvlToken.address);
  console.log("   Total Supply:", hre.ethers.utils.formatEther(await anvlToken.totalSupply()));

  // Get USDC address based on network
  let usdcAddress;
  if (network.chainId === 1) {
    // Mainnet
    usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  } else if (network.chainId === 11155111) {
    // Sepolia
    usdcAddress = "0x..." // Add Sepolia USDC address
  } else {
    throw new Error("Unsupported network");
  }
  console.log("\n2. USDC Address:", usdcAddress);

  // Deploy Presale Contract
  console.log("\n3. Deploying ANVL Presale...");
  const ANVLPresale = await hre.ethers.getContractFactory("ANVLPresale");
  const anvlPresale = await ANVLPresale.deploy(
    anvlToken.address,
    usdcAddress
  );
  await anvlPresale.deployed();
  console.log("✅ ANVL Presale deployed to:", anvlPresale.address);

  // Transfer tokens to presale contract
  console.log("\n4. Transferring tokens to presale contract...");
  const presaleAllocation = hre.ethers.utils.parseEther("200000000"); // 200M tokens for presale
  await anvlToken.transfer(anvlPresale.address, presaleAllocation);
  console.log("✅ Transferred 200M ANVL tokens to presale contract");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ANVLToken: {
        address: anvlToken.address,
        totalSupply: hre.ethers.utils.formatEther(await anvlToken.totalSupply())
      },
      ANVLPresale: {
        address: anvlPresale.address,
        presaleAllocation: hre.ethers.utils.formatEther(presaleAllocation),
        usdcAddress: usdcAddress
      }
    }
  };

  const deploymentPath = path.join(__dirname, `../deployments/${network.name}-deployment.json`);
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n✅ Deployment info saved to:", deploymentPath);

  console.log("\n🎉 Deployment complete!\n");
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
