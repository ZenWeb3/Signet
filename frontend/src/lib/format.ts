import { formatEther } from "viem";

export function truncateAddress(address?: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`;
}

export function formatMon(wei: bigint, maxDecimals = 3): string {
  const formatted = formatEther(wei);
  const [whole, decimal = ""] = formatted.split(".");
  if (decimal === "") return `${whole} MON`;
  const trimmed = decimal.slice(0, maxDecimals).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed} MON` : `${whole} MON`;
}

export type Countdown = {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
};

export function countdownTo(targetUnixSeconds: number, nowMs = Date.now()): Countdown {
  const totalSeconds = Math.floor(targetUnixSeconds - nowMs / 1000);
  const isPast = totalSeconds <= 0;
  const abs = Math.abs(totalSeconds);
  return {
    totalSeconds,
    days: Math.floor(abs / 86400),
    hours: Math.floor((abs % 86400) / 3600),
    minutes: Math.floor((abs % 3600) / 60),
    seconds: Math.floor(abs % 60),
    isPast,
  };
}

export function formatDurationShort(seconds: number): string {
  const days = Math.round(seconds / 86400);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`;
  const hours = Math.round(seconds / 3600);
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export function daysBetween(seconds: number): number {
  return Math.floor(seconds / 86400);
}
