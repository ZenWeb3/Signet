// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Signet} from "../../src/Signet.sol";

contract ReentrantWithdrawAttacker {
    Signet public signet;
    uint256 public amount;
    bool public attacked;

    // Signet's owner is fixed at construction, but this attacker needs to be that owner
    // before the Signet can exist — so wiring happens post-deploy instead of in the constructor.
    function setSignet(Signet _signet, uint256 _amount) external {
        signet = _signet;
        amount = _amount;
    }

    function attack() external {
        signet.withdraw(amount);
    }

    receive() external payable {
        if (!attacked) {
            attacked = true;
            signet.withdraw(amount);
        }
    }
}

contract ReentrantClaimAttacker {
    Signet public signet;
    bool public attacked;

    constructor(Signet _signet) {
        signet = _signet;
    }

    function attack() external {
        signet.claim(new address[](0));
    }

    receive() external payable {
        if (!attacked) {
            attacked = true;
            signet.claim(new address[](0));
        }
    }
}
