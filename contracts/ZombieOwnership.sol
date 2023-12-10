// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ZombieAttack.sol";
import "./ERC721.sol";

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ZombieOwnership is ZombieAttack, ERC721 {
    function balanceOf(address _owner) external view override returns (uint256) {
        return ownerZombieCount[_owner];
    }

    function ownerOf(uint256 _tokenId) external view override returns (address) {
        return zombieToOwner[_tokenId];
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) external payable override {
        // 3.
    }

    function approve(address _approved, uint256 _tokenId) external payable override {
        // 4.
    }
}
