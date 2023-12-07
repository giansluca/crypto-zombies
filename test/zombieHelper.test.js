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

    describe("Pay and Withdraw up", function () {
        it("Should pay to level up", async function () {
            // Given
            const { zombieHelperContract, owner, otherAccount1, otherAccount2 } =
                await loadFixture(deployOneYearLockFixture);
            const contractAddress = await zombieHelperContract.getAddress();
            await zombieHelperContract.connect(otherAccount1).createRandomZombie("Zulu-1");
            await zombieHelperContract.connect(otherAccount2).createRandomZombie("Zulu-2");

            const totalZombies = await zombieHelperContract.getZombies();
            const account1ZombiesIds = await zombieHelperContract.getZombiesByOwner(otherAccount1.address);
            const account2ZombiesIds = await zombieHelperContract.getZombiesByOwner(otherAccount2.address);

            // Then check creation
            expect(totalZombies).to.have.length(2);
            expect(account1ZombiesIds).to.have.length(1);
            expect(account2ZombiesIds).to.have.length(1);

            const account1ZombieId1 = account1ZombiesIds[0];
            const account2ZombieId1 = account2ZombiesIds[0];

            expect(totalZombies[account1ZombieId1].name).to.equal("Zulu-1");
            expect(totalZombies[account1ZombieId1].level).to.equal(1);
            expect(totalZombies[account2ZombieId1].name).to.equal("Zulu-2");
            expect(totalZombies[account2ZombieId1].level).to.equal(1);

            // Then check contract balance
            const balanceBigIntBeforeLevelUp = await ethers.provider.getBalance(contractAddress);
            const balanceBeforeLevelUp = ethers.formatEther(balanceBigIntBeforeLevelUp);
            expect(balanceBeforeLevelUp).to.equal("0.0");
            expect(Number(balanceBeforeLevelUp)).to.equal(0.0);

            // Then level Up
            const levelUpFeeKO = { value: ethers.parseEther("0.0001") };
            try {
                await zombieHelperContract.connect(otherAccount1).levelUp(account1ZombieId1, levelUpFeeKO);
            } catch (e) {
                expect(e.message).to.contain("level up fee must be 0.001 Eth");
            }

            const levelUpFeeOK = { value: ethers.parseEther("0.001") };
            await zombieHelperContract.connect(otherAccount1).levelUp(account1ZombieId1, levelUpFeeOK);
            await zombieHelperContract.connect(otherAccount1).levelUp(account1ZombieId1, levelUpFeeOK);
            const totalZombiesAfterLevelUp = await zombieHelperContract.getZombies();

            // Then check levels
            expect(totalZombiesAfterLevelUp).to.have.length(2);
            expect(totalZombiesAfterLevelUp[0].name).to.equal("Zulu-1");
            expect(totalZombiesAfterLevelUp[0].level).to.equal(3);

            expect(totalZombiesAfterLevelUp[1].name).to.equal("Zulu-2");
            expect(totalZombiesAfterLevelUp[1].level).to.equal(1);

            // Then check contract balance again and owner balance
            const balanceBigIntAfterLevelUp = await ethers.provider.getBalance(contractAddress);
            const balanceAfterLevelUp = ethers.formatEther(balanceBigIntAfterLevelUp);
            expect(balanceAfterLevelUp).to.equal("0.002");
            expect(Number(balanceAfterLevelUp)).to.equal(0.002);

            const ownerBalanceBigIntBefore = await ethers.provider.getBalance(owner.address);
            const ownerBalanceBefore = ethers.formatEther(ownerBalanceBigIntBefore);

            // Then withdraw
            await zombieHelperContract.connect(owner).withdraw();

            // Then check contract balance after withdraw
            const balanceBigIntAfterWithDraw = await ethers.provider.getBalance(contractAddress);
            const balanceAfterWithDraw = ethers.formatEther(balanceBigIntAfterWithDraw);
            expect(balanceAfterWithDraw).to.equal("0.0");
            expect(Number(balanceAfterWithDraw)).to.equal(0.0);

            // Then check owner balance after withdraw
            const ownerBalanceBigIntAfter = await ethers.provider.getBalance(owner.address);
            const ownerBalanceAfter = ethers.formatEther(ownerBalanceBigIntAfter);
            expect(Number(ownerBalanceAfter).toFixed(3)).to.equal((Number(ownerBalanceBefore) + 0.002).toFixed(3));
        });
    });
});
