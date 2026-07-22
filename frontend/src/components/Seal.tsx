"use client";

export function Seal({
  size = 64,
  broken = false,
  className = "",
}: {
  size?: number;
  broken?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke="var(--color-accent)"
        strokeWidth="2"
        className={broken ? "transition-opacity duration-1400 opacity-40" : ""}
      />
      {broken ? (
        <>
          <path
            d="M50 6 L46 46 L50 50 L54 46 Z"
            fill="var(--color-accent)"
            className="transition-transform duration-1800 ease-out"
            style={{ transform: "translate(-14px, -10px) rotate(-18deg)" }}
          />
          <path
            d="M50 6 L54 46 L50 50 L46 46 Z"
            fill="var(--color-accent)"
            className="transition-transform duration-1800 ease-out"
            style={{ transform: "translate(14px, -6px) rotate(16deg)" }}
          />
        </>
      ) : (
        <path d="M50 6 L54 46 L50 50 L46 46 Z" fill="var(--color-accent)" />
      )}
      <circle cx="50" cy="50" r="4" fill="var(--color-accent)" opacity={broken ? 0.3 : 1} />
      <path
        d="M50 60 C 44 66, 44 74, 50 80 C 56 74, 56 66, 50 60 Z"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        opacity={broken ? 0.25 : 0.85}
      />
    </svg>
  );
}
