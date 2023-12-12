// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ZombieAttack.sol";
import "./ERC721.sol";

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 *  @title — A contract that manages transferring zombie ownership
 *  @dev — Compliant with OpenZeppelin's implementation of the ERC721 spec draft
 */
contract ZombieOwnership is ZombieAttack, ERC721 {
    using Math for uint256;

    mapping(uint => address) zombieApprovals;

    function balanceOf(address _owner) external view override returns (uint256) {
        return ownerZombieCount[_owner];
    }

    function ownerOf(uint256 _tokenId) external view override returns (address) {
        return zombieToOwner[_tokenId];
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) external payable override {
        require(zombieToOwner[_tokenId] == msg.sender || zombieApprovals[_tokenId] == msg.sender);
        _transfer(_from, _to, _tokenId);
    }

    function approve(address _approved, uint256 _tokenId) external payable override onlyOwnerOf(_tokenId) {
        zombieApprovals[_tokenId] = _approved;

        emit Approval(msg.sender, _approved, _tokenId);
    }

    function _transfer(address _from, address _to, uint256 _tokenId) private {
        (bool add1, uint ownerCountTo) = ownerZombieCount[_to].tryAdd(1);
        require(add1 == true);
        ownerZombieCount[_to] = ownerCountTo;

        (bool add2, uint ownerCountFrom) = ownerZombieCount[_from].trySub(1);
        require(add2 == true);
        ownerZombieCount[_from] = ownerCountFrom;

        zombieToOwner[_tokenId] = _to;

        emit Transfer(_from, _to, _tokenId);
    }
}
