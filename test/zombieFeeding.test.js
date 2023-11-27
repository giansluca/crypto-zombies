const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("ZombieFeeding", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployOneYearLockFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount1, otherAccount2] = await ethers.getSigners();

        const ZombieFeeding = await ethers.getContractFactory("ZombieFeeding");
        const zombieFeedingContract = await ZombieFeeding.deploy();

        return { zombieFeedingContract, owner, otherAccount1, otherAccount2 };
    }

    describe("Deployment", function () {
        it("Should deploy", async function () {
            // Given
            const { zombieFeedingContract, owner } = await loadFixture(deployOneYearLockFixture);
            const contractAddress = await zombieFeedingContract.getAddress();
            const contractOwner = await zombieFeedingContract.contractOwner();

            // When
            const balanceBigInt = await ethers.provider.getBalance(contractAddress);
            const balance = ethers.formatEther(balanceBigInt);

            // Then
            expect(Number(balance)).to.equal(0.0);
            expect(contractOwner).to.equal(owner.address);
        });
    });

    describe("Feed Zombie", function () {
        it("Should feed a zombie", async function () {
            // Given
            const { zombieFeedingContract, owner, otherAccount1, otherAccount2 } =
                await loadFixture(deployOneYearLockFixture);
            await zombieFeedingContract.connect(owner).createRandomZombie("Zulu-1");
            await zombieFeedingContract.connect(otherAccount1).createRandomZombie("Zulu-2");
            await zombieFeedingContract.connect(otherAccount2).createRandomZombie("Zulu-3");

            // When
            try {
                await zombieFeedingContract.connect(otherAccount2).feedAndMultiply(1, 10, 334455);
            } catch (e) {
                expect(e.message).to.contain("Only zombie owner can feed!");
            }

            await zombieFeedingContract.connect(otherAccount1).feedAndMultiply(1, 10, 334455);
            const zombies = await zombieFeedingContract.getZombies();

            // Then
            expect(zombies).to.have.length(4);
            expect(zombies[0].name).to.equal("Zulu-1");
            expect(zombies[1].name).to.equal("Zulu-2");
            expect(zombies[2].name).to.equal("Zulu-3");
            expect(zombies[3].name).to.equal("NoName");
        });
    });

    describe("Events", function () {
        it("Should emit an event on zombie feeding", async function () {
            // Given
            const { zombieFeedingContract, owner, otherAccount1, otherAccount2 } =
                await loadFixture(deployOneYearLockFixture);
            await zombieFeedingContract.connect(owner).createRandomZombie("Zulu-1");
            await zombieFeedingContract.connect(otherAccount1).createRandomZombie("Zulu-2");
            await zombieFeedingContract.connect(otherAccount2).createRandomZombie("Zulu-3");

            // When Then
            await expect(await zombieFeedingContract.connect(otherAccount1).feedAndMultiply(1, 10, 334455))
                .to.emit(zombieFeedingContract, "NewZombie")
                .withArgs(3, "NoName", anyValue);
        });
    });

    describe("Set Kitty address", function () {
        it("Should set the kitty contract address", async function () {
            // Given
            const kittyAddress = "0x06012c8cf97bead5deae237070f9587f8e7a266d";
            const { zombieFeedingContract, owner, otherAccount1 } = await loadFixture(deployOneYearLockFixture);

            // When Then
            await zombieFeedingContract.connect(owner).setKittyContractAddress(kittyAddress);
            const kittyContractAddress = await zombieFeedingContract.kittyAddress();

            try {
                await zombieFeedingContract.connect(otherAccount1).setKittyContractAddress(kittyAddress);
            } catch (e) {
                expect(e.message).to.contain("Only contract owner can set kitty contract address");
            }

            expect(ethers.isAddress(kittyContractAddress)).to.be.true;
            expect(kittyContractAddress.toLowerCase()).to.be.equal(kittyAddress.toLowerCase());
        });
    });
});
