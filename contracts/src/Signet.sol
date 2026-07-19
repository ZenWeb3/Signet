// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice An onchain successor vault. Owner deposits assets and checks in periodically;
///         if silent past checkInInterval + gracePeriod, the beneficiary can claim.
contract Signet is ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant WARNING_WINDOW = 7 days;
    uint256 public constant MIN_INTERVAL = 1 days;
    uint256 public constant MAX_INTERVAL = 5 * 365 days;
    uint256 public constant MIN_GRACE = 1 days;
    uint256 public constant MAX_GRACE = 365 days;
    uint256 public constant MAX_FAREWELL_LENGTH = 500;

    address public owner;
    address public beneficiary;
    string public beneficiaryLabel;
    uint256 public checkInInterval; // seconds
    uint256 public gracePeriod; // seconds
    uint256 public lastCheckIn;
    string public farewell;
    bool public claimed;
    bool public farewellRevealed;

    event Deposited(address indexed sender, uint256 amount);
    event TokenDeposited(address indexed sender, address indexed token, uint256 amount);
    event Withdrawn(uint256 amount);
    event TokenWithdrawn(address indexed token, uint256 amount);
    event CheckIn(uint256 timestamp);
    event BeneficiaryUpdated(address indexed beneficiary, string label);
    event IntervalUpdated(uint256 newInterval);
    event GraceUpdated(uint256 newGrace);
    event FarewellUpdated();
    event Claimed(address indexed beneficiary, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyBeneficiary() {
        require(msg.sender == beneficiary, "not beneficiary");
        _;
    }

    modifier notClaimed() {
        require(!claimed, "already claimed");
        _;
    }

    constructor(
        address _owner,
        address _beneficiary,
        string memory _beneficiaryLabel,
        uint256 _checkInInterval,
        uint256 _gracePeriod,
        string memory _farewell
    ) {
        require(_owner != address(0), "owner is zero");
        require(_beneficiary != address(0), "beneficiary is zero");
        require(_checkInInterval >= MIN_INTERVAL && _checkInInterval <= MAX_INTERVAL, "interval out of range");
        require(_gracePeriod >= MIN_GRACE && _gracePeriod <= MAX_GRACE, "grace out of range");
        require(bytes(_farewell).length <= MAX_FAREWELL_LENGTH, "farewell too long");

        owner = _owner;
        beneficiary = _beneficiary;
        beneficiaryLabel = _beneficiaryLabel;
        checkInInterval = _checkInInterval;
        gracePeriod = _gracePeriod;
        farewell = _farewell;
        lastCheckIn = block.timestamp;
    }

    function deposit() external payable notClaimed {
        require(msg.value > 0, "zero amount");
        emit Deposited(msg.sender, msg.value);
    }

    function depositToken(address token, uint256 amount) external notClaimed {
        require(amount > 0, "zero amount");
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit TokenDeposited(msg.sender, token, amount);
    }

    function checkIn() external onlyOwner notClaimed {
        lastCheckIn = block.timestamp;
        emit CheckIn(block.timestamp);
    }

    function withdraw(uint256 amount) external onlyOwner notClaimed nonReentrant {
        require(amount > 0, "zero amount");
        require(address(this).balance >= amount, "insufficient balance");
        (bool success,) = owner.call{value: amount}("");
        require(success, "transfer failed");
        emit Withdrawn(amount);
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner notClaimed nonReentrant {
        require(amount > 0, "zero amount");
        IERC20(token).safeTransfer(owner, amount);
        emit TokenWithdrawn(token, amount);
    }

    function setBeneficiary(address _beneficiary, string calldata label) external onlyOwner notClaimed {
        require(_beneficiary != address(0), "beneficiary is zero");
        beneficiary = _beneficiary;
        beneficiaryLabel = label;
        emit BeneficiaryUpdated(_beneficiary, label);
    }

    function setInterval(uint256 newInterval) external onlyOwner notClaimed {
        require(newInterval >= MIN_INTERVAL && newInterval <= MAX_INTERVAL, "interval out of range");
        // Prevent owner from resetting the warning clock by shortening the interval mid-warning.
        if (newInterval < checkInInterval) {
            require(state() == 0, "cannot shorten during warning window");
        }
        checkInInterval = newInterval;
        emit IntervalUpdated(newInterval);
    }

    function setGrace(uint256 newGrace) external onlyOwner notClaimed {
        require(newGrace >= MIN_GRACE && newGrace <= MAX_GRACE, "grace out of range");
        gracePeriod = newGrace;
        emit GraceUpdated(newGrace);
    }

    function setFarewell(string calldata newFarewell) external onlyOwner notClaimed {
        require(bytes(newFarewell).length <= MAX_FAREWELL_LENGTH, "farewell too long");
        farewell = newFarewell;
        emit FarewellUpdated();
    }

    function claim(address[] calldata tokens) external onlyBeneficiary nonReentrant {
        require(isClaimable(), "not claimable");
        claimed = true;
        farewellRevealed = true;

        uint256 nativeBalance = address(this).balance;
        if (nativeBalance > 0) {
            (bool success,) = beneficiary.call{value: nativeBalance}("");
            require(success, "transfer failed");
        }

        for (uint256 i = 0; i < tokens.length; i++) {
            IERC20 token = IERC20(tokens[i]);
            uint256 tokenBalance = token.balanceOf(address(this));
            if (tokenBalance > 0) {
                token.safeTransfer(beneficiary, tokenBalance);
            }
        }

        emit Claimed(beneficiary, block.timestamp);
    }

    function isClaimable() public view returns (bool) {
        return !claimed && block.timestamp > lastCheckIn + checkInInterval + gracePeriod;
    }

    function expiresAt() public view returns (uint256) {
        return lastCheckIn + checkInInterval;
    }

    function claimableAt() public view returns (uint256) {
        return lastCheckIn + checkInInterval + gracePeriod;
    }

    function state() public view returns (uint8) {
        if (claimed) return 4;

        uint256 exp = expiresAt();
        uint256 claimAt = claimableAt();

        // Order matters: each branch relies on the prior ones having ruled out block.timestamp > exp,
        // so `exp - block.timestamp` below never underflows.
        if (block.timestamp > claimAt) return 3;
        if (block.timestamp > exp) return 2;
        if (exp - block.timestamp < WARNING_WINDOW) return 1;
        return 0;
    }
}
