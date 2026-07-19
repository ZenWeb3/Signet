// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SignetFactory} from "../src/SignetFactory.sol";
import {Signet} from "../src/Signet.sol";

contract SignetFactoryTest is Test {
    SignetFactory factory;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address beneficiary = makeAddr("beneficiary");

    function setUp() public {
        factory = new SignetFactory();
    }

    function test_CreateSignet_DeploysAndInitializes() public {
        vm.prank(alice);
        address signetAddr = factory.createSignet(beneficiary, "Kin", 30 days, 7 days, "bye");

        Signet signet = Signet(signetAddr);
        assertEq(signet.owner(), alice);
        assertEq(signet.beneficiary(), beneficiary);
        assertEq(signet.checkInInterval(), 30 days);
    }

    function test_CreateSignet_EmitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, false, true, false);
        emit SignetFactory.SignetCreated(alice, address(0), beneficiary, block.timestamp);
        factory.createSignet(beneficiary, "Kin", 30 days, 7 days, "bye");
    }

    function test_GetSignetsForOwner_TracksMultiple() public {
        vm.startPrank(alice);
        address s1 = factory.createSignet(beneficiary, "Kin", 30 days, 7 days, "bye1");
        vm.warp(block.timestamp + 1);
        address s2 = factory.createSignet(beneficiary, "Kin2", 60 days, 14 days, "bye2");
        vm.stopPrank();

        address[] memory owned = factory.getSignetsForOwner(alice);
        assertEq(owned.length, 2);
        assertEq(owned[0], s1);
        assertEq(owned[1], s2);
        assertEq(factory.getSignetsForOwner(bob).length, 0);
    }

    function test_AllSignets_Paginates() public {
        vm.startPrank(alice);
        for (uint256 i = 0; i < 5; i++) {
            factory.createSignet(beneficiary, "Kin", 30 days, 7 days, "bye");
            vm.warp(block.timestamp + 1);
        }
        vm.stopPrank();

        assertEq(factory.allSignetsCount(), 5);

        address[] memory page = factory.allSignets(1, 2);
        assertEq(page.length, 2);

        address[] memory tail = factory.allSignets(4, 10);
        assertEq(tail.length, 1);

        address[] memory outOfRange = factory.allSignets(10, 5);
        assertEq(outOfRange.length, 0);
    }

    function test_CreateSignet_DifferentSaltsPerCall() public {
        vm.startPrank(alice);
        address s1 = factory.createSignet(beneficiary, "Kin", 30 days, 7 days, "bye");
        vm.warp(block.timestamp + 1);
        address s2 = factory.createSignet(beneficiary, "Kin", 30 days, 7 days, "bye");
        vm.stopPrank();

        assertTrue(s1 != s2);
    }

    function test_CreateSignet_SameBlockDoesNotCollide() public {
        vm.startPrank(alice);
        address s1 = factory.createSignet(beneficiary, "Kin", 30 days, 7 days, "bye");
        // No warp — same block.timestamp as first call.
        address s2 = factory.createSignet(beneficiary, "Kin", 30 days, 7 days, "bye");
        vm.stopPrank();

        assertTrue(s1 != s2);
        assertEq(factory.getSignetsForOwner(alice).length, 2);
    }
}
