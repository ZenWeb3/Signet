import { useSyncExternalStore } from "react";
import { useBalance, useReadContract, useReadContracts } from "wagmi";
import { SIGNET_ABI, FACTORY_ADDRESS, FACTORY_ABI } from "@/lib/contracts";

function subscribeToClock(callback: () => void) {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}

function getClockSnapshot() {
  return Math.floor(Date.now() / 1000);
}

function getClockServerSnapshot() {
  return 0;
}

export function useNow(): number {
  return useSyncExternalStore(subscribeToClock, getClockSnapshot, getClockServerSnapshot);
}

export function useMySignets(owner?: `0x${string}`) {
  return useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getSignetsForOwner",
    args: owner ? [owner] : undefined,
    query: { enabled: Boolean(owner) },
  });
}

export function useSignetSummary(signet?: `0x${string}`) {
  const contracts = useReadContracts({
    contracts: [
      { address: signet, abi: SIGNET_ABI, functionName: "owner" },
      { address: signet, abi: SIGNET_ABI, functionName: "beneficiary" },
      { address: signet, abi: SIGNET_ABI, functionName: "beneficiaryLabel" },
      { address: signet, abi: SIGNET_ABI, functionName: "checkInInterval" },
      { address: signet, abi: SIGNET_ABI, functionName: "gracePeriod" },
      { address: signet, abi: SIGNET_ABI, functionName: "lastCheckIn" },
      { address: signet, abi: SIGNET_ABI, functionName: "expiresAt" },
      { address: signet, abi: SIGNET_ABI, functionName: "claimableAt" },
      { address: signet, abi: SIGNET_ABI, functionName: "state" },
      { address: signet, abi: SIGNET_ABI, functionName: "claimed" },
      { address: signet, abi: SIGNET_ABI, functionName: "farewell" },
      { address: signet, abi: SIGNET_ABI, functionName: "farewellRevealed" },
    ] as const,
    query: { enabled: Boolean(signet), refetchInterval: 15_000 },
  });

  const balance = useBalance({
    address: signet,
    query: { enabled: Boolean(signet), refetchInterval: 15_000 },
  });

  const [
    owner,
    beneficiary,
    beneficiaryLabel,
    checkInInterval,
    gracePeriod,
    lastCheckIn,
    expiresAt,
    claimableAt,
    state,
    claimed,
    farewell,
    farewellRevealed,
  ] = contracts.data ?? [];

  return {
    isLoading: contracts.isLoading || balance.isLoading,
    refetch: () => {
      contracts.refetch();
      balance.refetch();
    },
    owner: owner?.result as `0x${string}` | undefined,
    beneficiary: beneficiary?.result as `0x${string}` | undefined,
    beneficiaryLabel: beneficiaryLabel?.result as string | undefined,
    checkInInterval: checkInInterval?.result as bigint | undefined,
    gracePeriod: gracePeriod?.result as bigint | undefined,
    lastCheckIn: lastCheckIn?.result as bigint | undefined,
    expiresAt: expiresAt?.result as bigint | undefined,
    claimableAt: claimableAt?.result as bigint | undefined,
    state: state?.result as number | undefined,
    claimed: claimed?.result as boolean | undefined,
    farewell: farewell?.result as string | undefined,
    farewellRevealed: farewellRevealed?.result as boolean | undefined,
    balance: balance.data?.value,
  };
}
