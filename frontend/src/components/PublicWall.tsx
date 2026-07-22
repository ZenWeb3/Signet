"use client";

import { useEffect, useMemo, useState } from "react";
import { useReadContract, useReadContracts, usePublicClient } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI, SIGNET_ABI, SIGNET_STATE } from "@/lib/contracts";
import { truncateAddress, formatMon, daysBetween } from "@/lib/format";
import { useNow } from "@/lib/hooks";

type Filter = "newest" | "expiring" | "largest";

export function PublicWall({ embedded = false }: { embedded?: boolean }) {
  const [filter, setFilter] = useState<Filter>("newest");

  const countQuery = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "allSignetsCount",
  });

  const total = Number(countQuery.data ?? 0n);
  const pageSize = embedded ? 6 : 100;
  const offset = Math.max(0, total - pageSize);
  const limit = total - offset;

  const pageQuery = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "allSignets",
    args: [BigInt(offset), BigInt(limit)],
    query: { enabled: total > 0 },
  });

  const addresses = useMemo(
    () => (pageQuery.data as `0x${string}`[] | undefined) ?? [],
    [pageQuery.data]
  );

  const detailsQuery = useReadContracts({
    contracts: addresses.flatMap(
      (address) =>
        [
          { address, abi: SIGNET_ABI, functionName: "state" },
          { address, abi: SIGNET_ABI, functionName: "expiresAt" },
        ] as const
    ),
    query: { enabled: addresses.length > 0, refetchInterval: 20_000 },
  });

  const publicClient = usePublicClient();
  const [balances, setBalances] = useState<Record<string, bigint>>({});

  useEffect(() => {
    if (!publicClient || addresses.length === 0) return;
    let cancelled = false;
    Promise.all(addresses.map((a) => publicClient.getBalance({ address: a }))).then(
      (results) => {
        if (cancelled) return;
        const next: Record<string, bigint> = {};
        addresses.forEach((a, i) => {
          next[a] = results[i];
        });
        setBalances(next);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [publicClient, addresses]);

  const rows = useMemo(() => {
    return addresses
      .map((address, i) => ({
        address,
        state: detailsQuery.data?.[i * 2]?.result as number | undefined,
        expiresAt: detailsQuery.data?.[i * 2 + 1]?.result as bigint | undefined,
        balance: balances[address],
      }))
      .filter((r) => r.state !== undefined && r.state !== SIGNET_STATE.CLAIMED);
  }, [addresses, detailsQuery.data, balances]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    if (filter === "expiring") {
      copy.sort((a, b) => Number((a.expiresAt ?? 0n) - (b.expiresAt ?? 0n)));
    } else if (filter === "largest") {
      copy.sort((a, b) => Number((b.balance ?? 0n) - (a.balance ?? 0n)));
    } else {
      copy.reverse();
    }
    return copy;
  }, [rows, filter]);

  const visible = embedded ? sorted.slice(0, 6) : sorted;
  const now = useNow();

  return (
    <div>
      {!embedded && (
        <div className="flex gap-6 mb-8 text-sm font-medium">
          {(["newest", "expiring", "largest"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                filter === f ? "text-accent" : "text-muted hover:text-fg transition-colors"
              }
            >
              {f === "newest" ? "Newest" : f === "expiring" ? "Expiring soon" : "Largest"}
            </button>
          ))}
        </div>
      )}
      <div className="divide-y divide-muted/20 font-mono text-sm">
        {countQuery.isLoading && <p className="text-muted py-6">Reading the ledger…</p>}
        {!countQuery.isLoading && visible.length === 0 && (
          <p className="text-muted py-6">No active Signets yet.</p>
        )}
        {visible.map((row) => {
          const daysLeft = row.expiresAt ? daysBetween(Number(row.expiresAt) - now) : null;
          const silent = row.state === SIGNET_STATE.GRACE || row.state === SIGNET_STATE.CLAIMABLE;
          return (
            <div key={row.address} className="flex items-center justify-between py-3 gap-4">
              <span className="text-fg">{truncateAddress(row.address)}</span>
              <span className={silent ? "text-wax" : "text-muted"}>
                {silent
                  ? "silence detected"
                  : daysLeft !== null && daysLeft >= 0
                    ? `renews in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
                    : "renewal overdue"}
              </span>
              <span className="text-accent shrink-0">
                {row.balance !== undefined ? formatMon(row.balance) : "…"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
