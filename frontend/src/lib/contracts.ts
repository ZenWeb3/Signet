import type { Abi } from "viem";
import factoryAbi from "./factory-abi.json";
import signetAbi from "./signet-abi.json";

export const FACTORY_ADDRESS = process.env
  .NEXT_PUBLIC_SIGNET_FACTORY_ADDRESS as `0x${string}`;

export const FACTORY_ABI = factoryAbi as unknown as Abi;
export const SIGNET_ABI = signetAbi as unknown as Abi;

export const SIGNET_STATE = {
  HEALTHY: 0,
  WARNING: 1,
  GRACE: 2,
  CLAIMABLE: 3,
  CLAIMED: 4,
} as const;
