const { ethers } = require("hardhat");

async function main() {
    console.log(ethers);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
