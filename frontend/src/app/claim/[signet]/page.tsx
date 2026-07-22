"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Nav } from "@/components/Nav";
import { Seal } from "@/components/Seal";
import { useNow, useSignetSummary } from "@/lib/hooks";
import { SIGNET_ABI, SIGNET_STATE } from "@/lib/contracts";
import { formatMon, truncateAddress, formatDurationShort } from "@/lib/format";

export default function ClaimPage() {
  const params = useParams<{ signet: string }>();
  const signetAddress = params.signet as `0x${string}`;
  const summary = useSignetSummary(signetAddress);
  const { authenticated, user, login } = usePrivy();
  const myAddress = user?.wallet?.address?.toLowerCase();

  const [claimedBalance, setClaimedBalance] = useState<bigint | null>(null);
  const claimCall = useWriteContract();
  const claimReceipt = useWaitForTransactionReceipt({ hash: claimCall.data });

  const now = useNow();
  const lastCheckInAgo = summary.lastCheckIn ? now - Number(summary.lastCheckIn) : null;
  const isBeneficiary = myAddress && summary.beneficiary && myAddress === summary.beneficiary.toLowerCase();
  const claimable = summary.state === SIGNET_STATE.CLAIMABLE;
  const claimed = summary.claimed || claimReceipt.isSuccess;

  function handleClaim() {
    if (!authenticated) {
      login();
      return;
    }
    setClaimedBalance(summary.balance ?? 0n);
    claimCall.writeContract({
      address: signetAddress,
      abi: SIGNET_ABI,
      functionName: "claim",
      args: [[]],
    });
  }

  if (summary.isLoading) {
    return (
      <div className="flex flex-col flex-1">
        <Nav />
        <main className="flex-1 flex items-center justify-center text-muted">Reading the vault…</main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Nav />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-8 text-center max-w-lg mx-auto">
        {claimed ? (
          <>
            <Seal size={72} broken />
            <div className="farewell-unfurl flex flex-col gap-4">
              <p className="text-lg text-fg">
                {summary.beneficiaryLabel || truncateAddress(summary.owner)} has gone silent.
              </p>
              <p className="whitespace-pre-wrap text-xl font-medium text-accent leading-relaxed">
                {summary.farewell || "…"}
              </p>
              <p className="text-sm text-muted font-mono">
                {formatMon(claimedBalance ?? summary.balance ?? 0n)} claimed
              </p>
            </div>
          </>
        ) : claimable ? (
          <>
            <Seal size={72} />
            <p className="text-lg text-fg">
              {truncateAddress(summary.owner)} has gone silent. You can claim this Signet.
            </p>
            {!isBeneficiary && authenticated && (
              <p className="text-sm text-wax">
                Connected wallet isn&apos;t the named beneficiary — the claim transaction will revert.
              </p>
            )}
            <button
              onClick={handleClaim}
              disabled={claimCall.isPending || claimReceipt.isLoading}
              className="rounded-full bg-fg px-8 py-3 text-sm font-medium text-bg hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {claimCall.isPending || claimReceipt.isLoading ? "Claiming…" : "Claim"}
            </button>
          </>
        ) : (
          <>
            <Seal size={72} />
            <p className="text-lg text-fg">
              You&apos;ve been named as kin on a Signet. Nothing to do yet.
            </p>
            <p className="text-sm text-muted">
              Last renewed {lastCheckInAgo !== null ? formatDurationShort(lastCheckInAgo) : "recently"} ago.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
