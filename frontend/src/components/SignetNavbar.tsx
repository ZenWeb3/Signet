"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { href: "#features", label: "Features" },
  { href: "#security", label: "Security" },
  { href: "#network", label: "Network" },
  { href: "#faq", label: "FAQ" },
  { href: "/wall", label: "Wall" },
];

export default function SignetNavbar({ className }: { className?: string }) {
  const { login } = usePrivy();
  return (
    <header
      className={cn(
        "sticky top-4 z-50 mx-auto w-full max-w-5xl px-4",
        className,
      )}
    >
      <div className="relative flex items-center justify-between gap-2 rounded-full border border-white/10 bg-background/60 px-3 py-2 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]">
        <Link
          href="/"
          className="flex items-center gap-2 pl-3 pr-4 text-sm font-semibold text-foreground"
        >
          Signet
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => login()}
            className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors px-3"
          >
            Sign in
          </button>
          <Button
            size="sm"
            onClick={() => login()}
            className="rounded-full"
          >
            Launch app
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav className="grid gap-6 text-lg font-medium mt-8">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
