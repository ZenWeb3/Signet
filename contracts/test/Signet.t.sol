// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Signet} from "../src/Signet.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {ReentrantWithdrawAttacker, ReentrantClaimAttacker} from "./mocks/ReentrantAttacker.sol";

contract SignetTest is Test {
    Signet signet;
    ERC20Mock token;

    address owner = makeAddr("owner");
    address beneficiary = makeAddr("beneficiary");
    address stranger = makeAddr("stranger");

    uint256 constant INTERVAL = 30 days;
    uint256 constant GRACE = 7 days;

    function setUp() public {
        vm.prank(owner);
        signet = new Signet(owner, beneficiary, "Kin", INTERVAL, GRACE, "goodbye");
        token = new ERC20Mock();
    }

    function _fund(uint256 amount) internal {
        vm.deal(address(this), amount);
        signet.deposit{value: amount}();
    }

    // --- deposit ---

    function test_Deposit() public {
        _fund(1 ether);
        assertEq(address(signet).balance, 1 ether);
    }

    function test_DepositToken() public {
        token.mint(address(this), 100e18);
        token.approve(address(signet), 100e18);
        signet.depositToken(address(token), 100e18);
        assertEq(token.balanceOf(address(signet)), 100e18);
    }

    function test_Deposit_RevertsAfterClaimed() public {
        vm.warp(block.timestamp + INTERVAL + GRACE + 1);
        vm.prank(beneficiary);
        signet.claim(new address[](0));

        vm.expectRevert("already claimed");
        signet.deposit{value: 1}();
    }

    // --- check-in ---

    function test_CheckIn_UpdatesLastCheckIn() public {
        vm.warp(block.timestamp + 10 days);
        vm.prank(owner);
        signet.checkIn();
        assertEq(signet.lastCheckIn(), block.timestamp);
        assertEq(uint256(signet.state()), 0);
    }

    function test_CheckIn_RevertsForNonOwner() public {
        vm.expectRevert("not owner");
        vm.prank(stranger);
        signet.checkIn();
    }

    // --- withdraw ---

    function test_Withdraw() public {
        _fund(1 ether);
        uint256 before = owner.balance;
        vm.prank(owner);
        signet.withdraw(0.4 ether);
        assertEq(owner.balance, before + 0.4 ether);
        assertEq(address(signet).balance, 0.6 ether);
    }

    function test_Withdraw_RevertsForNonOwner() public {
        _fund(1 ether);
        vm.expectRevert("not owner");
        vm.prank(stranger);
        signet.withdraw(0.1 ether);
    }

    function test_WithdrawToken_RevertsForNonOwner() public {
        token.mint(address(signet), 10e18);
        vm.expectRevert("not owner");
        vm.prank(stranger);
        signet.withdrawToken(address(token), 1e18);
    }

    // --- guards on setters ---

    function test_SetBeneficiary_RevertsForNonOwner() public {
        vm.expectRevert("not owner");
        vm.prank(stranger);
        signet.setBeneficiary(stranger, "Impostor");
    }

    function test_SetInterval_RevertsForNonOwner() public {
        vm.expectRevert("not owner");
        vm.prank(stranger);
        signet.setInterval(60 days);
    }

    function test_SetInterval_CannotShortenDuringWarningWindow() public {
        vm.warp(block.timestamp + INTERVAL - 1 days); // 1 day to expiry: warning window
        assertEq(uint256(signet.state()), 1);

        vm.prank(owner);
        vm.expectRevert("cannot shorten during warning window");
        signet.setInterval(INTERVAL - 1 days);
    }

    function test_SetInterval_CanLengthenDuringWarningWindow() public {
        vm.warp(block.timestamp + INTERVAL - 1 days);
        vm.prank(owner);
        signet.setInterval(INTERVAL + 10 days);
        assertEq(signet.checkInInterval(), INTERVAL + 10 days);
    }

    function test_SetFarewell_RevertsWhenTooLong() public {
        bytes memory long = new bytes(501);
        vm.prank(owner);
        vm.expectRevert("farewell too long");
        signet.setFarewell(string(long));
    }

    // --- claim ---

    function test_Claim_RevertsBeforeEligible() public {
        vm.expectRevert("not claimable");
        vm.prank(beneficiary);
        signet.claim(new address[](0));
    }

    function test_Claim_RevertsForNonBeneficiary() public {
        vm.warp(block.timestamp + INTERVAL + GRACE + 1);
        vm.expectRevert("not beneficiary");
        vm.prank(stranger);
        signet.claim(new address[](0));
    }

    function test_Claim_SucceedsAfterEligible() public {
        _fund(2 ether);
        token.mint(address(signet), 50e18);

        vm.warp(block.timestamp + INTERVAL + GRACE + 1);
        assertTrue(signet.isClaimable());

        address[] memory tokens = new address[](1);
        tokens[0] = address(token);

        uint256 before = beneficiary.balance;
        vm.prank(beneficiary);
        signet.claim(tokens);

        assertEq(beneficiary.balance, before + 2 ether);
        assertEq(token.balanceOf(beneficiary), 50e18);
        assertTrue(signet.claimed());
        assertTrue(signet.farewellRevealed());
        assertEq(uint256(signet.state()), 4);
    }

    function test_FarewellRevealed_FalseBeforeClaim() public view {
        assertFalse(signet.farewellRevealed());
    }

    // --- state machine ---

    function test_State_Healthy() public view {
        assertEq(uint256(signet.state()), 0);
    }

    function test_State_Warning() public {
        vm.warp(block.timestamp + INTERVAL - 6 days);
        assertEq(uint256(signet.state()), 1);
    }

    function test_State_Grace() public {
        vm.warp(block.timestamp + INTERVAL + 1);
        assertEq(uint256(signet.state()), 2);
    }

    function test_State_Claimable() public {
        vm.warp(block.timestamp + INTERVAL + GRACE + 1);
        assertEq(uint256(signet.state()), 3);
        assertTrue(signet.isClaimable());
    }

    // --- reentrancy ---

    function test_Reentrancy_WithdrawBlocked() public {
        ReentrantWithdrawAttacker attacker = new ReentrantWithdrawAttacker();
        Signet victim = new Signet(address(attacker), beneficiary, "Kin", INTERVAL, GRACE, "bye");
        attacker.setSignet(victim, 0.5 ether);

        vm.deal(address(this), 1 ether);
        victim.deposit{value: 1 ether}();

        vm.expectRevert("transfer failed");
        attacker.attack();

        assertEq(address(victim).balance, 1 ether);
    }

    function test_Reentrancy_ClaimBlocked() public {
        ReentrantClaimAttacker attacker = new ReentrantClaimAttacker(signet);
        vm.prank(owner);
        signet.setBeneficiary(address(attacker), "Kin");

        _fund(1 ether);
        vm.warp(block.timestamp + INTERVAL + GRACE + 1);

        vm.expectRevert("transfer failed");
        attacker.attack();

        assertFalse(signet.claimed());
    }
}
