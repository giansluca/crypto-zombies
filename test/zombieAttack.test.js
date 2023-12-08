const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("ZombieAttack", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployOneYearLockFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount1, otherAccount2] = await ethers.getSigners();

        const ZombieAttack = await ethers.getContractFactory("ZombieAttack");
        const zombieAttackContract = await ZombieAttack.deploy();

        return { zombieAttackContract, owner, otherAccount1, otherAccount2 };
    }

    describe("Deployment", function () {
        it("Should deploy", async function () {
            // Given
            const { zombieAttackContract, owner } = await loadFixture(deployOneYearLockFixture);
            const contractAddress = await zombieAttackContract.getAddress();
            const contractOwner = await zombieAttackContract.owner();

            // When
            const balanceBigInt = await ethers.provider.getBalance(contractAddress);
            const balance = ethers.formatEther(balanceBigInt);

            // Then
            expect(Number(balance)).to.equal(0.0);
            expect(contractOwner).to.equal(owner.address);
        });
    });

    describe("Zombie attack", function () {
        it("Should attack", async function () {
            // Given
            const { zombieAttackContract, owner, otherAccount1, otherAccount2 } =
                await loadFixture(deployOneYearLockFixture);
            await zombieAttackContract.connect(owner).createRandomZombie("Zulu-1");
            await zombieAttackContract.connect(otherAccount1).createRandomZombie("Zulu-2");
            await zombieAttackContract.connect(otherAccount2).createRandomZombie("Zulu-3");

            // When Then
            await zombieAttackContract.connect(owner).attack(0, 1);
        });
    });
});
