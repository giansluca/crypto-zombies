// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract ZombieFactory {

    event NewZombie(uint zombieId, string name, uint dna);

    uint dnaDigits = 16;
    uint dnaModulus = 10 ** dnaDigits;

    struct Zombie {
        string name;
        uint dna;
    }

    Zombie[] zombies;

    // Address of contract deployer
    address payable public owner;

    // Deploy logic
    constructor() {
        owner = payable(msg.sender);
    }

    function _createZombie(string memory _name, uint _dna) private {
        zombies.push(Zombie(_name, _dna));
        uint id = zombies.length - 1;
        emit NewZombie(id, _name, _dna);
    }

    function _generateRandomDna(string memory _str) private view returns (uint) {
        uint rand = uint(keccak256(abi.encodePacked(_str)));
        return rand % dnaModulus;
    }

    /**
     * @dev create a zombie
     */
    function createRandomZombie(string memory _name) public {
        uint randDna = _generateRandomDna(_name);
        _createZombie(_name, randDna);
    }

    /**
    *  @dev retrieve all the zombies
    */
    function getZombies() public view returns (Zombie[] memory) {
        return zombies;
    }

}