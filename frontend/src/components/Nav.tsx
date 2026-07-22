"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { truncateAddress } from "@/lib/format";

const links = [
  { href: "/vault", label: "Vault" },
  { href: "/wall", label: "Wall" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  const pathname = usePathname();
  const { authenticated, user, logout, login } = usePrivy();
  const address = user?.wallet?.address;

  return (
    <nav className="w-full max-w-3xl mx-auto flex items-center justify-between px-6 py-6 text-sm font-medium">
      <Link href="/" className="tracking-wide text-fg">
        Signet
      </Link>
      <div className="flex items-center gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href
                ? "text-accent"
                : "text-muted hover:text-fg transition-colors"
            }
          >
            {link.label}
          </Link>
        ))}
        {authenticated ? (
          <button
            onClick={() => logout()}
            className="font-mono text-xs text-muted hover:text-fg transition-colors"
          >
            {truncateAddress(address)}
          </button>
        ) : (
          <button
            onClick={() => login()}
            className="text-muted hover:text-fg transition-colors"
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}
