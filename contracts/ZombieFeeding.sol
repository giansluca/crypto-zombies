// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ZombieFactory.sol";

interface KittyInterface {
     function getKitty(uint256 _id) external view returns (
        bool isGestating,
        bool isReady,
        uint256 cooldownIndex,
        uint256 nextActionAt,
        uint256 siringWithId,
        uint256 birthTime,
        uint256 matronId,
        uint256 sireId,
        uint256 generation,
        uint256 genes
    );
}

contract ZombieFeeding is ZombieFactory {

    address public kittyAddress;
    KittyInterface kittyContract;

    function setKittyContractAddress(address _address) public {
        require(msg.sender == contractOwner, "Only contract owner can set kitty contract address");
        kittyAddress = _address;
        kittyContract = KittyInterface(_address);
    }

    function feedAndMultiply(uint _zombieId, uint _targetDna, string memory _species) public {
        require(msg.sender == zombieToOwner[_zombieId], "Only zombie owner can feed!");
        Zombie storage myZombie = zombies[_zombieId];

        _targetDna = _targetDna % dnaModulus;
        uint newDna = (myZombie.dna + _targetDna) / 2;

        if (keccak256(abi.encodePacked(_species)) == keccak256(abi.encodePacked("kitty"))) {
            newDna = newDna - newDna % 100 + 99;
        }

        _createZombie("NoName", newDna);
    }

    function feedOnKitty(uint _zombieId, uint _kittyId) public {
        uint kittyDna;
        (,,,,,,,,,kittyDna) = kittyContract.getKitty(_kittyId);

        feedAndMultiply(_zombieId, kittyDna, "kitty");
    }

}