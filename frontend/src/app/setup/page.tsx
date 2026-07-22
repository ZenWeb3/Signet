"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { usePublicClient, useWriteContract } from "wagmi";
import { decodeEventLog, isAddress, parseEther } from "viem";
import { Nav } from "@/components/Nav";
import { useMySignets } from "@/lib/hooks";
import { FACTORY_ADDRESS, FACTORY_ABI, SIGNET_ABI } from "@/lib/contracts";
import { truncateAddress } from "@/lib/format";

type Step = 1 | 2 | 3;

export default function SetupPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}` | undefined;
  const mySignets = useMySignets(address);

  const [step, setStep] = useState<Step>(1);
  const [amount, setAmount] = useState("0.1");
  const [beneficiary, setBeneficiary] = useState("");
  const [label, setLabel] = useState("");
  const [intervalDays, setIntervalDays] = useState(30);
  const [graceDays, setGraceDays] = useState(14);
  const [farewell, setFarewell] = useState("");
  const [phase, setPhase] = useState<"idle" | "deploying" | "depositing" | "done">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createSignetCall = useWriteContract();
  const depositCall = useWriteContract();
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      router.push("/");
      return;
    }
    if (mySignets.isLoading) return;
    const owned = (mySignets.data as string[] | undefined) ?? [];
    if (owned.length > 0) router.push("/vault");
  }, [ready, authenticated, mySignets.isLoading, mySignets.data, router]);

  const beneficiaryValid = isAddress(beneficiary);
  const farewellValid = farewell.length <= 500;

  async function forgeSignet() {
    if (!publicClient) return;
    setErrorMessage(null);
    setPhase("deploying");
    try {
      const createHash = await createSignetCall.writeContractAsync({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "createSignet",
        args: [
          beneficiary as `0x${string}`,
          label,
          BigInt(intervalDays * 86400),
          BigInt(graceDays * 86400),
          farewell,
        ],
      });
      const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createHash });

      let newSignet: `0x${string}` | undefined;
      for (const log of createReceipt.logs) {
        try {
          const decoded = decodeEventLog({ abi: FACTORY_ABI, data: log.data, topics: log.topics });
          if (decoded.eventName === "SignetCreated") {
            newSignet = (decoded.args as unknown as { signet: `0x${string}` }).signet;
            break;
          }
        } catch {
          continue;
        }
      }
      if (!newSignet) {
        setErrorMessage("Vault deployed, but the address could not be read from the transaction.");
        setPhase("idle");
        return;
      }

      const depositAmount = parseFloat(amount || "0");
      if (depositAmount > 0) {
        setPhase("depositing");
        const depositHash = await depositCall.writeContractAsync({
          address: newSignet,
          abi: SIGNET_ABI,
          functionName: "deposit",
          value: parseEther(amount),
        });
        await publicClient.waitForTransactionReceipt({ hash: depositHash });
      }

      setPhase("done");
      router.push("/vault");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Transaction failed.");
      setPhase("idle");
    }
  }

  const displayName = address ? truncateAddress(address) : "";
  const busy = phase !== "idle";

  return (
    <div className="flex flex-col flex-1">
      <Nav />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div key={step} className="step-enter w-full max-w-lg">
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-bold leading-snug">
                Welcome, {displayName}. What do you want to leave behind?
              </h1>
              <label className="flex flex-col gap-2 text-sm text-muted">
                Amount (MON)
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-md border border-muted/30 bg-transparent px-4 py-3 font-mono text-lg text-fg focus:border-accent focus:outline-none"
                />
              </label>
              <button
                onClick={() => setStep(2)}
                disabled={!(parseFloat(amount) >= 0)}
                className="self-start rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-bold leading-snug">Who&apos;s your kin?</h1>
              <label className="flex flex-col gap-2 text-sm text-muted">
                Beneficiary address
                <input
                  type="text"
                  placeholder="0x…"
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value.trim())}
                  className="rounded-md border border-muted/30 bg-transparent px-4 py-3 font-mono text-fg focus:border-accent focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-muted">
                Label (optional)
                <input
                  type="text"
                  placeholder="e.g. my sister"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="rounded-md border border-muted/30 bg-transparent px-4 py-3 text-fg focus:border-accent focus:outline-none"
                />
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-full border border-muted/30 px-6 py-3 text-sm font-medium text-muted hover:text-fg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!beneficiaryValid}
                  className="rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-bold leading-snug">How long is your silence?</h1>
              <label className="flex flex-col gap-2 text-sm text-muted">
                Check-in interval — {intervalDays} days
                <input
                  type="range"
                  min={1}
                  max={365}
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(Number(e.target.value))}
                  className="accent-accent"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-muted">
                Grace period — {graceDays} days
                <input
                  type="range"
                  min={1}
                  max={180}
                  value={graceDays}
                  onChange={(e) => setGraceDays(Number(e.target.value))}
                  className="accent-accent"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-muted">
                Farewell message ({farewell.length}/500)
                <textarea
                  rows={4}
                  maxLength={500}
                  value={farewell}
                  onChange={(e) => setFarewell(e.target.value)}
                  className="rounded-md border border-muted/30 bg-transparent px-4 py-3 text-fg focus:border-accent focus:outline-none resize-none"
                />
              </label>
              {errorMessage && <p className="text-sm text-wax">{errorMessage}</p>}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={busy}
                  className="rounded-full border border-muted/30 px-6 py-3 text-sm font-medium text-muted hover:text-fg transition-colors disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  onClick={forgeSignet}
                  disabled={busy || !beneficiaryValid || !farewellValid}
                  className="rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {phase === "deploying"
                    ? "Deploying vault…"
                    : phase === "depositing"
                      ? "Depositing…"
                      : "Forge Signet"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
