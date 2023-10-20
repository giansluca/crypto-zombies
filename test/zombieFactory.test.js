const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("ZombieFactory", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployOneYearLockFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const ZombieFactory = await ethers.getContractFactory("ZombieFactory");
        const zombieFactory = await ZombieFactory.deploy();

        return { zombieFactory, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should deploy", async function () {
            // Given
            const { zombieFactory, owner } = await loadFixture(deployOneYearLockFixture);
            const contractAddress = await zombieFactory.getAddress();
            const contractOwner = await zombieFactory.owner();

            // When
            const balanceBigInt = await ethers.provider.getBalance(contractAddress);
            const balance = ethers.formatEther(balanceBigInt);

            // Then
            expect(Number(balance)).to.equal(0.0);
            expect(contractOwner).to.equal(owner.address);
        });
    });

    describe("Create Zombie", function () {
        it("Should create some zombies", async function () {
            // Given
            const { zombieFactory, otherAccount } = await loadFixture(deployOneYearLockFixture);

            // When
            await zombieFactory.connect(otherAccount).createRandomZombie("Zulu-1");
            await zombieFactory.connect(otherAccount).createRandomZombie("Zulu-2");
            await zombieFactory.connect(otherAccount).createRandomZombie("Zulu-3");

            const zombies = await zombieFactory.getZombies();

            // Then
            expect(zombies).to.have.length(3);
            expect(zombies[0].name).to.equal("Zulu-1");
            expect(zombies[1].name).to.equal("Zulu-2");
            expect(zombies[2].name).to.equal("Zulu-3");
        });
    });
});
