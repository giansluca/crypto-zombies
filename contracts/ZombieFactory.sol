// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ZombieFactory {

    event NewZombie(uint zombieId, string name, uint dna);

    struct Zombie {
        string name;
        uint dna;
    }

    Zombie[] zombies;
    uint dnaDigits = 16;
    uint dnaModulus = 10 ** dnaDigits;
    mapping (uint => address) public zombieToOwner;
    mapping (address => uint) ownerZombieCount;
    address payable public contractOwner;

    constructor() {
        contractOwner = payable(msg.sender);
    }

    function _createZombie(string memory _name, uint _dna) internal {
        zombies.push(Zombie(_name, _dna));
        uint id = zombies.length - 1;

        zombieToOwner[id] = msg.sender;
        ownerZombieCount[msg.sender]++;

        emit NewZombie(id, _name, _dna);
    }

    function _generateRandomDna(string memory _str) private view returns (uint) {
        uint rand = uint(keccak256(abi.encodePacked(_str)));
        return rand % dnaModulus;
    }

    function createRandomZombie(string memory _name) public {
        if (msg.sender != contractOwner)
            require(ownerZombieCount[msg.sender] == 0, "Each user can create only one zombie!");

        uint randDna = _generateRandomDna(_name);
        _createZombie(_name, randDna);
    }

    function getZombies() public view returns (Zombie[] memory) {
        return zombies;
    }
}