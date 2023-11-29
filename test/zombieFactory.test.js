const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("ZombieFactory", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployOneYearLockFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount1, otherAccount2] = await ethers.getSigners();

        const ZombieFactory = await ethers.getContractFactory("ZombieFactory");
        const zombieFactoryContract = await ZombieFactory.deploy();

        return { zombieFactoryContract, owner, otherAccount1, otherAccount2 };
    }

    describe("Deployment", function () {
        it("Should deploy", async function () {
            // Given
            const { zombieFactoryContract, owner } = await loadFixture(deployOneYearLockFixture);
            const contractAddress = await zombieFactoryContract.getAddress();
            const contractOwner = await zombieFactoryContract.owner();

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
            const { zombieFactoryContract, owner, otherAccount1 } = await loadFixture(deployOneYearLockFixture);

            // When
            await zombieFactoryContract.createRandomZombie("Zulu-1");
            await zombieFactoryContract.connect(owner).createRandomZombie("Zulu-2");
            await zombieFactoryContract.connect(otherAccount1).createRandomZombie("Zulu-3");

            try {
                await zombieFactoryContract.connect(otherAccount1).createRandomZombie("Zulu-4");
            } catch (e) {
                expect(e.message).to.contain("Each user can create only one zombie!");
            }

            const zombies = await zombieFactoryContract.getZombies();
            const zombieOwner1 = await zombieFactoryContract.zombieToOwner(0);
            const zombieOwner2 = await zombieFactoryContract.zombieToOwner(1);
            const zombieOwner3 = await zombieFactoryContract.zombieToOwner(2);

            // Then
            expect(zombies).to.have.length(3);

            expect(zombies[0].name).to.equal("Zulu-1");
            expect(zombies[0].level).to.equal(1);
            expect(new Date(Number(zombies[0].readyTime) * 1000)).to.be.greaterThan(new Date());
            expect(zombieOwner1).to.be.equal(owner.address);

            expect(zombies[1].name).to.equal("Zulu-2");
            expect(zombies[1].level).to.equal(1);
            expect(new Date(Number(zombies[1].readyTime) * 1000)).to.be.greaterThan(new Date());
            expect(zombieOwner2).to.be.equal(owner.address);

            expect(zombies[2].name).to.equal("Zulu-3");
            expect(zombies[2].level).to.equal(1);
            expect(new Date(Number(zombies[2].readyTime) * 1000)).to.be.greaterThan(new Date());
            expect(zombieOwner3).to.be.equal(otherAccount1.address);
        });
    });

    describe("Events", function () {
        it("Should emit an event on zombie creation", async function () {
            // Given
            const { zombieFactoryContract } = await loadFixture(deployOneYearLockFixture);

            // When Then
            await expect(await zombieFactoryContract.createRandomZombie("Zulu-1"))
                .to.emit(zombieFactoryContract, "NewZombie")
                .withArgs(0, "Zulu-1", anyValue);
        });
    });
});
