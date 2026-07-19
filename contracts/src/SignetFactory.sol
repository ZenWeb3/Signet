// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Signet} from "./Signet.sol";

contract SignetFactory {
    event SignetCreated(
        address indexed owner, address indexed signet, address indexed beneficiary, uint256 timestamp
    );

    mapping(address => address[]) private signetsByOwner;
    address[] private signets;

    function createSignet(
        address beneficiary,
        string calldata label,
        uint256 checkInInterval,
        uint256 gracePeriod,
        string calldata farewell
    ) external returns (address signet) {
        bytes32 salt = keccak256(abi.encodePacked(msg.sender, block.timestamp));
        signet = address(
            new Signet{salt: salt}(msg.sender, beneficiary, label, checkInInterval, gracePeriod, farewell)
        );

        signetsByOwner[msg.sender].push(signet);
        signets.push(signet);

        emit SignetCreated(msg.sender, signet, beneficiary, block.timestamp);
    }

    function getSignetsForOwner(address owner) external view returns (address[] memory) {
        return signetsByOwner[owner];
    }

    function allSignetsCount() external view returns (uint256) {
        return signets.length;
    }

    function allSignets(uint256 offset, uint256 limit) external view returns (address[] memory page) {
        uint256 total = signets.length;
        if (offset >= total) {
            return new address[](0);
        }
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        page = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = signets[i];
        }
    }
}
