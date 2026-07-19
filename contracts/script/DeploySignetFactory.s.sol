// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {SignetFactory} from "../src/SignetFactory.sol";

contract DeploySignetFactory is Script {
    function run() external returns (SignetFactory factory) {
        vm.startBroadcast();
        factory = new SignetFactory();
        vm.stopBroadcast();
        console.log("SignetFactory deployed at:", address(factory));
    }
}
