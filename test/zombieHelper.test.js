const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("ZombieHelper", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployOneYearLockFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount1, otherAccount2] = await ethers.getSigners();

        const ZombieHelper = await ethers.getContractFactory("ZombieHelper");
        const zombieHelperContract = await ZombieHelper.deploy();

        return { zombieHelperContract, owner, otherAccount1, otherAccount2 };
    }

    describe("Deployment", function () {
        it("Should deploy", async function () {
            // Given
            const { zombieHelperContract, owner } = await loadFixture(deployOneYearLockFixture);
            const contractAddress = await zombieHelperContract.getAddress();
            const contractOwner = await zombieHelperContract.owner();

            // When
            const balanceBigInt = await ethers.provider.getBalance(contractAddress);
            const balance = ethers.formatEther(balanceBigInt);

            // Then
            expect(Number(balance)).to.equal(0.0);
            expect(contractOwner).to.equal(owner.address);
        });
    });

    describe("Change Zombie name and Dna", function () {
        it("Should throw if level is not enough", async function () {
            // Given
            const { zombieHelperContract, owner, otherAccount1, otherAccount2 } =
                await loadFixture(deployOneYearLockFixture);
            await zombieHelperContract.connect(owner).createRandomZombie("Zulu-1");
            await zombieHelperContract.connect(otherAccount1).createRandomZombie("Zulu-2");
            await zombieHelperContract.connect(otherAccount2).createRandomZombie("Zulu-3");

            // When
            try {
                await zombieHelperContract.connect(otherAccount1).changeName(0, "Bubu");
            } catch (e) {
                expect(e.message).to.contain("level not sufficient");
            }

            try {
                await zombieHelperContract.connect(otherAccount1).changeName(1, 999999);
            } catch (e) {
                expect(e.message).to.contain("level not sufficient");
            }

            const zombies = await zombieHelperContract.getZombies();

            // Then
            expect(zombies).to.have.length(3);
        });
    });

    describe("Get owner zombies", function () {
        it("Should get all the owner zombies", async function () {
            // Given
            const { zombieHelperContract, owner } = await loadFixture(deployOneYearLockFixture);
            await zombieHelperContract.createRandomZombie("Zulu-1");
            await zombieHelperContract.connect(owner).createRandomZombie("Zulu-2");

            // When
            const ownerZombiesIds = await zombieHelperContract.connect(owner).getZombiesByOwner(owner.address);

            // Then
            expect(ownerZombiesIds).to.have.length(2);
            expect(ownerZombiesIds[0]).to.equal(0);
            expect(ownerZombiesIds[1]).to.equal(1);
        });
    });

    describe("Level up", function () {
        it("Should pay to level up", async function () {
            // Given
            const { zombieHelperContract, owner } = await loadFixture(deployOneYearLockFixture);
            await zombieHelperContract.connect(owner).createRandomZombie("Zulu-1");
            await zombieHelperContract.createRandomZombie("Zulu-2");

            const zombies = await zombieHelperContract.getZombies();
            const ownerZombiesIds = await zombieHelperContract.getZombiesByOwner(owner.address);

            // Then check creation
            expect(zombies).to.have.length(2);
            expect(ownerZombiesIds).to.have.length(2);
            const zombieId1 = ownerZombiesIds[0];
            const zombieId2 = ownerZombiesIds[1];

            expect(zombies[0].name).to.equal("Zulu-1");
            expect(zombies[0].level).to.equal(1);
            expect(new Date(Number(zombies[0].readyTime) * 1000)).to.be.greaterThan(new Date());

            expect(zombies[1].name).to.equal("Zulu-2");
            expect(zombies[1].level).to.equal(1);
            expect(new Date(Number(zombies[1].readyTime) * 1000)).to.be.greaterThan(new Date());

            // Level Up
            const levelUpFeeKO = { value: ethers.parseEther("0.0001") };
            try {
                await zombieHelperContract.levelUp(zombieId1, levelUpFeeKO);
            } catch (e) {
                expect(e.message).to.contain("level up fee must be 0.001 Eth");
            }

            const levelUpFeeOK = { value: ethers.parseEther("0.001") };
            await zombieHelperContract.levelUp(zombieId2, levelUpFeeOK);
            const zombiesAfterLevelUp = await zombieHelperContract.getZombies();

            // Then
            expect(zombiesAfterLevelUp).to.have.length(2);
            expect(zombiesAfterLevelUp[0].name).to.equal("Zulu-1");
            expect(zombiesAfterLevelUp[0].level).to.equal(1);

            expect(zombiesAfterLevelUp[1].name).to.equal("Zulu-2");
            expect(zombiesAfterLevelUp[1].level).to.equal(2);
        });
    });
});
