"use client";

import { countdownTo } from "@/lib/format";
import { useNow } from "@/lib/hooks";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function Countdown({ target }: { target: number }) {
  const now = useNow();

  if (now === 0) {
    return (
      <div className="font-mono font-medium text-[clamp(3rem,10vw,7.5rem)] leading-none text-fg tabular-nums">
        --:--:--
      </div>
    );
  }

  const { days, hours, minutes, isPast } = countdownTo(target, now * 1000);

  return (
    <div
      className={`font-mono font-medium text-[clamp(3rem,10vw,7.5rem)] leading-none tabular-nums ${
        isPast ? "text-wax" : "text-fg"
      }`}
    >
      {pad(days)} : {pad(hours)} : {pad(minutes)}
    </div>
  );
}
