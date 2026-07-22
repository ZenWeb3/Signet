"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useWriteContract } from "wagmi";
import { isAddress, parseEther } from "viem";
import { Nav } from "@/components/Nav";
import { Countdown } from "@/components/Countdown";
import { useMySignets, useNow, useSignetSummary } from "@/lib/hooks";
import { SIGNET_ABI, SIGNET_STATE } from "@/lib/contracts";
import { formatMon, truncateAddress, daysBetween } from "@/lib/format";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-t border-muted/20 py-4">
      <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-medium text-fg">
        {title}
        <span className="text-muted group-open:rotate-180 transition-transform">⌄</span>
      </summary>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </details>
  );
}

export default function VaultPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}` | undefined;
  const mySignets = useMySignets(address);

  const owned = (mySignets.data as `0x${string}`[] | undefined) ?? [];
  const signetAddress = owned[owned.length - 1];
  const summary = useSignetSummary(signetAddress);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      router.push("/");
      return;
    }
    if (mySignets.isLoading) return;
    if (owned.length === 0) router.push("/setup");
  }, [ready, authenticated, mySignets.isLoading, owned.length, router]);

  const checkInCall = useWriteContract();

  const now = useNow();
  const daysLeft = summary.expiresAt ? daysBetween(Number(summary.expiresAt) - now) : 0;
  const hoursLeft = summary.expiresAt ? Math.round((Number(summary.expiresAt) - now) / 3600) : 0;
  const claimDaysLeft = summary.claimableAt ? daysBetween(Number(summary.claimableAt) - now) : 0;
  const kin = summary.beneficiaryLabel || truncateAddress(summary.beneficiary);

  const greeting = useMemo(() => {
    switch (summary.state) {
      case SIGNET_STATE.HEALTHY:
        return `Your Signet renews in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Kin: ${kin}.`;
      case SIGNET_STATE.WARNING:
        return `Your Signet expires in ${Math.max(hoursLeft, 0)} hour${hoursLeft === 1 ? "" : "s"}. Renew now.`;
      case SIGNET_STATE.GRACE:
        return `Silence detected. Your kin can claim in ${claimDaysLeft} day${claimDaysLeft === 1 ? "" : "s"} unless you renew.`;
      case SIGNET_STATE.CLAIMABLE:
        return "Your Signet is claimable by your kin right now. Renew immediately to keep it.";
      case SIGNET_STATE.CLAIMED:
        return "This Signet has passed. Deploy a new one?";
      default:
        return "";
    }
  }, [summary.state, daysLeft, hoursLeft, claimDaysLeft, kin]);

  const countdownTarget =
    summary.state === SIGNET_STATE.GRACE || summary.state === SIGNET_STATE.CLAIMABLE
      ? Number(summary.claimableAt ?? 0)
      : Number(summary.expiresAt ?? 0);

  if (!signetAddress || summary.isLoading || now === 0) {
    return (
      <div className="flex flex-col flex-1">
        <Nav />
        <main className="flex-1 flex items-center justify-center text-muted">Reading your Signet…</main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Nav />
      <main className="flex-1 flex flex-col items-center px-6 py-12 gap-10 max-w-2xl mx-auto w-full">
        <p className="text-center text-lg text-fg">{greeting}</p>

        {summary.state === SIGNET_STATE.CLAIMED ? (
          <Link
            href="/setup"
            className="rounded-full bg-fg px-8 py-3 text-sm font-medium text-bg hover:opacity-90 transition-opacity"
          >
            Deploy a new Signet
          </Link>
        ) : (
          <>
            <Countdown target={countdownTarget} />
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted">Kin: {kin}</p>
              <button
                onClick={() => checkInCall.writeContract({ address: signetAddress, abi: SIGNET_ABI, functionName: "checkIn" })}
                disabled={checkInCall.isPending}
                className="rounded-full bg-fg px-8 py-3 text-sm font-medium text-bg hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {checkInCall.isPending ? "Renewing…" : "Renew Signet"}
              </button>
              <p className="text-xs text-muted font-mono">
                {summary.balance !== undefined ? formatMon(summary.balance) : "…"} held
              </p>
            </div>
          </>
        )}

        <div className="w-full">
          <VaultControls signetAddress={signetAddress} summary={summary} />
        </div>
      </main>
    </div>
  );
}

function VaultControls({
  signetAddress,
  summary,
}: {
  signetAddress: `0x${string}`;
  summary: ReturnType<typeof useSignetSummary>;
}) {
  const depositCall = useWriteContract();
  const withdrawCall = useWriteContract();
  const beneficiaryCall = useWriteContract();
  const intervalCall = useWriteContract();
  const graceCall = useWriteContract();
  const farewellCall = useWriteContract();

  const [depositAmount, setDepositAmount] = useState("");
  const [depositToken, setDepositToken] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawToken, setWithdrawToken] = useState("");
  const [newBeneficiary, setNewBeneficiary] = useState(summary.beneficiary ?? "");
  const [newLabel, setNewLabel] = useState(summary.beneficiaryLabel ?? "");
  const [newIntervalDays, setNewIntervalDays] = useState(
    summary.checkInInterval ? Number(summary.checkInInterval) / 86400 : 30
  );
  const [newGraceDays, setNewGraceDays] = useState(
    summary.gracePeriod ? Number(summary.gracePeriod) / 86400 : 14
  );
  const [newFarewell, setNewFarewell] = useState(summary.farewell ?? "");

  const disabled = summary.claimed;

  return (
    <div className="flex flex-col">
      <Section title="Deposit">
        <input
          type="number"
          placeholder="Amount (MON)"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          className="rounded-md border border-muted/30 bg-transparent px-4 py-2 font-mono text-fg focus:border-accent focus:outline-none"
        />
        <input
          type="text"
          placeholder="ERC-20 token address (optional)"
          value={depositToken}
          onChange={(e) => setDepositToken(e.target.value.trim())}
          className="rounded-md border border-muted/30 bg-transparent px-4 py-2 font-mono text-fg focus:border-accent focus:outline-none"
        />
        <button
          disabled={disabled || depositCall.isPending || !depositAmount}
          onClick={() =>
            depositToken && isAddress(depositToken)
              ? depositCall.writeContract({
                  address: signetAddress,
                  abi: SIGNET_ABI,
                  functionName: "depositToken",
                  args: [depositToken as `0x${string}`, parseEther(depositAmount)],
                })
              : depositCall.writeContract({
                  address: signetAddress,
                  abi: SIGNET_ABI,
                  functionName: "deposit",
                  value: parseEther(depositAmount || "0"),
                })
          }
          className="self-start rounded-full border border-fg/20 px-5 py-2 text-sm text-fg hover:bg-fg hover:text-bg transition-colors disabled:opacity-40"
        >
          {depositCall.isPending ? "Depositing…" : "Deposit"}
        </button>
      </Section>

      <Section title="Withdraw">
        <input
          type="number"
          placeholder="Amount (MON)"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          className="rounded-md border border-muted/30 bg-transparent px-4 py-2 font-mono text-fg focus:border-accent focus:outline-none"
        />
        <input
          type="text"
          placeholder="ERC-20 token address (optional)"
          value={withdrawToken}
          onChange={(e) => setWithdrawToken(e.target.value.trim())}
          className="rounded-md border border-muted/30 bg-transparent px-4 py-2 font-mono text-fg focus:border-accent focus:outline-none"
        />
        <button
          disabled={disabled || withdrawCall.isPending || !withdrawAmount}
          onClick={() =>
            withdrawToken && isAddress(withdrawToken)
              ? withdrawCall.writeContract({
                  address: signetAddress,
                  abi: SIGNET_ABI,
                  functionName: "withdrawToken",
                  args: [withdrawToken as `0x${string}`, parseEther(withdrawAmount)],
                })
              : withdrawCall.writeContract({
                  address: signetAddress,
                  abi: SIGNET_ABI,
                  functionName: "withdraw",
                  args: [parseEther(withdrawAmount || "0")],
                })
          }
          className="self-start rounded-full border border-fg/20 px-5 py-2 text-sm text-fg hover:bg-fg hover:text-bg transition-colors disabled:opacity-40"
        >
          {withdrawCall.isPending ? "Withdrawing…" : "Withdraw"}
        </button>
      </Section>

      <Section title="Edit beneficiary">
        <input
          type="text"
          placeholder="Beneficiary address"
          value={newBeneficiary}
          onChange={(e) => setNewBeneficiary(e.target.value.trim())}
          className="rounded-md border border-muted/30 bg-transparent px-4 py-2 font-mono text-fg focus:border-accent focus:outline-none"
        />
        <input
          type="text"
          placeholder="Label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="rounded-md border border-muted/30 bg-transparent px-4 py-2 text-fg focus:border-accent focus:outline-none"
        />
        <button
          disabled={disabled || beneficiaryCall.isPending || !isAddress(newBeneficiary)}
          onClick={() =>
            beneficiaryCall.writeContract({
              address: signetAddress,
              abi: SIGNET_ABI,
              functionName: "setBeneficiary",
              args: [newBeneficiary as `0x${string}`, newLabel],
            })
          }
          className="self-start rounded-full border border-fg/20 px-5 py-2 text-sm text-fg hover:bg-fg hover:text-bg transition-colors disabled:opacity-40"
        >
          {beneficiaryCall.isPending ? "Saving…" : "Save beneficiary"}
        </button>
      </Section>

      <Section title="Edit intervals">
        <label className="flex flex-col gap-2 text-sm text-muted">
          Check-in interval — {newIntervalDays} days
          <input
            type="range"
            min={1}
            max={365}
            value={newIntervalDays}
            onChange={(e) => setNewIntervalDays(Number(e.target.value))}
            className="accent-accent"
          />
        </label>
        <button
          disabled={disabled || intervalCall.isPending}
          onClick={() =>
            intervalCall.writeContract({
              address: signetAddress,
              abi: SIGNET_ABI,
              functionName: "setInterval",
              args: [BigInt(Math.round(newIntervalDays * 86400))],
            })
          }
          className="self-start rounded-full border border-fg/20 px-5 py-2 text-sm text-fg hover:bg-fg hover:text-bg transition-colors disabled:opacity-40"
        >
          Save interval
        </button>
        <label className="flex flex-col gap-2 text-sm text-muted">
          Grace period — {newGraceDays} days
          <input
            type="range"
            min={1}
            max={180}
            value={newGraceDays}
            onChange={(e) => setNewGraceDays(Number(e.target.value))}
            className="accent-accent"
          />
        </label>
        <button
          disabled={disabled || graceCall.isPending}
          onClick={() =>
            graceCall.writeContract({
              address: signetAddress,
              abi: SIGNET_ABI,
              functionName: "setGrace",
              args: [BigInt(Math.round(newGraceDays * 86400))],
            })
          }
          className="self-start rounded-full border border-fg/20 px-5 py-2 text-sm text-fg hover:bg-fg hover:text-bg transition-colors disabled:opacity-40"
        >
          Save grace period
        </button>
      </Section>

      <Section title="Edit farewell">
        <textarea
          rows={4}
          maxLength={500}
          value={newFarewell}
          onChange={(e) => setNewFarewell(e.target.value)}
          className="rounded-md border border-muted/30 bg-transparent px-4 py-2 text-fg focus:border-accent focus:outline-none resize-none"
        />
        <button
          disabled={disabled || farewellCall.isPending}
          onClick={() =>
            farewellCall.writeContract({
              address: signetAddress,
              abi: SIGNET_ABI,
              functionName: "setFarewell",
              args: [newFarewell],
            })
          }
          className="self-start rounded-full border border-fg/20 px-5 py-2 text-sm text-fg hover:bg-fg hover:text-bg transition-colors disabled:opacity-40"
        >
          {farewellCall.isPending ? "Saving…" : "Save farewell"}
        </button>
      </Section>
    </div>
  );
}
