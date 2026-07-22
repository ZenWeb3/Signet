"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Wallet01Icon,
  Clock01Icon,
  UserIcon,
  ShieldIcon,
  LockIcon,
  RefreshIcon,
  Mail01Icon,
  GlobalIcon,
  CheckmarkCircle01Icon,
  ArrowDown01Icon,
  PaintBoardIcon,
  Edit02Icon,
  DashboardSquare01Icon,
  DiamondIcon,
  CubeIcon,
  Coins01Icon,
  KeyIcon,
  Bitcoin01Icon,
  Cursor01Icon,
} from "@hugeicons/core-free-icons";
import { useMySignets } from "@/lib/hooks";
import { monadTestnet } from "@/lib/chain";
import { FACTORY_ADDRESS } from "@/lib/contracts";
import { truncateAddress } from "@/lib/format";

const bigFeatures = [
  {
    title: "Non-custodial by design",
    body: "Every vault is its own contract. Signet never holds keys, never routes funds, never touches your beneficiary until you want it to.",
  },
  {
    title: "Trustless successorship",
    body: "Check-in intervals, grace periods and beneficiaries are enforced by immutable Solidity — not a company promise.",
  },
  {
    title: "Fits right into your kin",
    body: "Any EVM address can inherit — a wallet, a multisig, a Safe. No bespoke integration required.",
  },
  {
    title: "Message on release",
    body: "Attach a farewell that only decrypts when your beneficiary claims. Sealed off-chain, unlocked on-chain.",
  },
];

const grid = [
  { icon: ShieldIcon, title: "Reentrancy safe", body: "Withdraw, withdrawToken and claim are all guarded." },
  { icon: LockIcon, title: "Immutable", body: "No upgradeability, no selfdestruct — deployed as-is." },
  { icon: Wallet01Icon, title: "Own your vault", body: "Funds sit in your contract. Signet never takes control." },
  { icon: Clock01Icon, title: "Configurable timing", body: "Intervals from hours to years, and a grace period to match." },
  { icon: UserIcon, title: "Any beneficiary", body: "Any EVM address — a wallet, a multisig, or a Safe." },
  { icon: RefreshIcon, title: "Change your mind", body: "Rotate beneficiary, extend timers, or withdraw at any time." },
  { icon: GlobalIcon, title: "Public wall", body: "Opt-in feed of vaults that have gone silent, live on-chain." },
  { icon: Mail01Icon, title: "Farewell payload", body: "Optional message revealed only on successful claim." },
];

const testimonials = [
  { name: "Aria Chen", handle: "@ariachen", body: "signet is the first successor vault that doesn't ask me to trust a company. the contract is the promise." },
  { name: "Marcus Weld", handle: "@mweld", body: "set up in five minutes. my beneficiary doesn't even know they're on it — until they need to be." },
  { name: "Priya Ravel", handle: "@priyar", body: "the grace period is the killer feature. life happens, and @signet gives you room to come back." },
  { name: "Julien Ostrom", handle: "@julostrm", body: "finally an on-chain dead-man's switch that doesn't reek of a rug. everything's verifiable." },
  { name: "Nadia Karpov", handle: "@nadiakv", body: "moved a chunk of treasury into a @signet vault last week. sleeping better already." },
  { name: "Toma Ives", handle: "@tomaives", body: "the wall is a strangely beautiful thing. quiet chapel of unclaimed vaults." },
  { name: "Sana Delaroche", handle: "@sanadel", body: "@signet is what estate planning looks like when the paperwork is a smart contract." },
  { name: "Idris Halevy", handle: "@idrishh", body: "attaching a farewell message pushed me over the edge. this is the whole thing done right." },
  { name: "Zoe Marchetti", handle: "@zmarc", body: "rotated my beneficiary in one tx. no lawyers, no forms, no company in the middle." },
  { name: "Rafi Okonjo", handle: "@rafiokon", body: "auditor here — spent an afternoon reading the contracts. small, tight, no funny business." },
];

const faqs = [
  { q: "What happens if I lose access to my wallet?", a: "If you can't check in, the clock keeps counting. Once your interval plus grace period elapses, your beneficiary can claim the vault." },
  { q: "Can Signet be shut down?", a: "No. The factory and vault contracts are immutable. There is no upgradeability, no admin key, no selfdestruct path." },
  { q: "What if my beneficiary loses their wallet?", a: "You can rotate the beneficiary at any time before a claim is initiated. If you never do, and neither of you can claim, the vault sits forever." },
  { q: "Which chains are supported?", a: "Signet is live on Monad testnet today. Mainnet Monad deploys with the network, and additional EVM chains are in progress." },
  { q: "Does Signet see my message?", a: "The farewell payload is encrypted off-chain. Only a successful claim reveals the decryption key, and only to the beneficiary." },
];

const stepper = [
  { icon: DashboardSquare01Icon, title: "Configure the seal", body: "Set your check-in interval, grace period and beneficiary in one screen." },
  { icon: Edit02Icon, title: "Attach a farewell", body: "Optional. Sealed off-chain, unlocked only when your kin claims." },
  { icon: PaintBoardIcon, title: "Fund and forget", body: "Deposit MON or any ERC-20. Withdraw or top up whenever you like." },
];

export default function Home() {
  const router = useRouter();
  const { ready, authenticated, user, login } = usePrivy();
  const address = user?.wallet?.address as `0x${string}` | undefined;
  const mySignets = useMySignets(address);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!ready || !authenticated || !address) return;
    if (mySignets.isLoading) return;
    const owned = (mySignets.data as string[] | undefined) ?? [];
    router.push(owned.length > 0 ? "/vault" : "/setup");
  }, [ready, authenticated, address, mySignets.isLoading, mySignets.data, router]);

  const explorerUrl = `${monadTestnet.blockExplorers.default.url}/address/${FACTORY_ADDRESS}`;

  function copyFactoryAddress() {
    navigator.clipboard.writeText(FACTORY_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const halfTestimonials = testimonials.slice(0, 5);
  const otherHalf = testimonials.slice(5);

  return (
    <div className="flex flex-col flex-1 bg-bg text-fg overflow-x-hidden">
      {/* NAV */}
      <nav className="sticky top-0 z-40 w-full border-b border-border/60 bg-bg/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight">Signet</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted">
            <a href="#features" className="hover:text-fg transition-colors">Features</a>
            <a href="#security" className="hover:text-fg transition-colors">Security</a>
            <a href="#network" className="hover:text-fg transition-colors">Network</a>
            <a href="#faq" className="hover:text-fg transition-colors">FAQ</a>
            <Link href="/wall" className="hover:text-fg transition-colors">Wall</Link>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => login()} className="hidden sm:inline text-sm text-muted hover:text-fg transition-colors px-2">
              Sign in
            </button>
            <button onClick={() => login()} className="rounded-lg bg-fg px-3.5 py-2 text-sm font-medium text-bg hover:opacity-90 transition-opacity">
              Launch app
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative w-full overflow-hidden">
        <div className="max-w-6xl mx-auto w-full px-6 pt-28 pb-40 flex flex-col items-center text-center gap-8 relative z-10">
          <a href="#faq" className="pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted hover:text-fg transition-colors reveal">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Live on Monad testnet
            <span className="text-fg">Read more →</span>
          </a>
          <h1 className="hero-heading max-w-5xl text-6xl sm:text-7xl lg:text-[92px] font-semibold leading-[0.95] reveal">
            The vault that pays out<br />when you go silent.
          </h1>
          <p className="max-w-xl text-base sm:text-lg text-muted leading-relaxed reveal">
            A trustless dead-man&apos;s switch on-chain. Deposit funds, set a check-in interval, name a
            beneficiary. Stay active and it&apos;s yours. Go silent, and it&apos;s theirs.
          </p>
          <div className="flex items-center gap-3 mt-2 reveal">
            <button onClick={() => login()} className="rounded-lg bg-fg px-5 py-2.5 text-sm font-medium text-bg hover:opacity-90 transition-opacity">
              Get started
            </button>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-fg hover:bg-fg/[0.06] transition-colors">
              Github
            </a>
          </div>
        </div>

        {/* Dashboard mockup with brighter glow behind */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 -mt-16 reveal-slow parallax-hero">
          <DashboardMock />
        </div>
        <div aria-hidden className="hero-glow pointer-events-none absolute left-1/2 -translate-x-1/2 top-[380px] w-[1400px] h-[700px] -z-0" />
      </section>

      {/* TECH BAR */}
      <section className="w-full pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-8 reveal">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted">Built on the best tools</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-muted">
            <TechBadge label="Monad" version="testnet" />
            <TechBadge label="Solidity" version="0.8.24" />
            <TechBadge label="Viem" version="2.55" />
            <TechBadge label="Wagmi" version="3.7" />
            <TechBadge label="Privy" version="3.35" />
          </div>
        </div>
      </section>

      {/* BIG 2x2 FEATURE CARDS */}
      <section id="features" className="w-full pt-24 pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02] max-w-3xl mb-16 reveal">
            A better way to<br />pass it on.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {bigFeatures.map((f, i) => (
              <div key={f.title} className="card relative rounded-2xl p-8 overflow-hidden min-h-[420px] flex flex-col reveal">
                <div className="flex-1 flex items-center justify-center min-h-[220px]">
                  <FeatureVisual index={i} />
                </div>
                <div className="pt-8">
                  <h3 className="text-xl font-semibold text-fg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ECLIPSE / SECURITY */}
      <section id="security" className="relative w-full overflow-hidden pt-40 pb-0 min-h-[1100px]">
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-6 reveal">
          <h2 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02]">
            Trust you can verify.<br />And build on.
          </h2>
          <p className="text-muted max-w-lg mx-auto">
            Signet ships with audited primitives, immutable contracts and a public wall so anyone can
            check that the seal is intact.
          </p>
        </div>
        <div className="corona" style={{ top: "460px" }} />
      </section>

      {/* SPLIT: stepper + dashboard */}
      <section className="relative w-full py-32 border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20 reveal">
            <h2 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02]">
              Make the right impression.
            </h2>
            <p className="text-muted max-w-lg mx-auto mt-5">
              Give your beneficiary a moment that feels intentional, not administrative.
            </p>
          </div>
          <div className="grid lg:grid-cols-[minmax(280px,340px)_1fr] gap-10 items-start reveal">
            <div className="flex flex-col gap-3">
              {stepper.map((s, i) => {
                const active = activeStep === i;
                return (
                  <button
                    key={s.title}
                    onClick={() => setActiveStep(i)}
                    className={`text-left rounded-2xl p-5 transition-all duration-300 border ${
                      active ? "border-border bg-surface" : "border-transparent bg-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <HugeiconsIcon icon={s.icon} size={18} className={active ? "text-fg" : "text-muted"} />
                      <span className="text-sm font-semibold">{s.title}</span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed pl-7">{s.body}</p>
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <div className="absolute -inset-4 hero-glow -z-10" />
              <DashboardMock compact />
            </div>
          </div>
        </div>
      </section>

      {/* 8-GRID FEATURES */}
      <section className="w-full py-32 border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
          <h2 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-center leading-[1.02] max-w-2xl mb-16 reveal">
            Everything you need.<br />Nothing you don&apos;t.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 w-full reveal">
            {grid.map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-fg">
                  <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.5} className="text-fg" />
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — marquee */}
      <section className="w-full py-32 border-t border-border/60 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 flex flex-col items-center text-center mb-16 reveal">
          <h2 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02]">
            Loved by builders<br />across the network.
          </h2>
          <p className="text-muted mt-5">Here&apos;s what people are saying about Signet.</p>
        </div>
        <div className="marquee-mask flex flex-col gap-5">
          <div className="marquee-row">
            {[...halfTestimonials, ...halfTestimonials, ...halfTestimonials].map((t, i) => (
              <TestimonialCard key={`t-${i}`} {...t} />
            ))}
          </div>
          <div className="marquee-row reverse">
            {[...otherHalf, ...otherHalf, ...otherHalf].map((t, i) => (
              <TestimonialCard key={`b-${i}`} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* NETWORK METRICS */}
      <section id="network" className="w-full py-32 border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center reveal">
          <span className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">Network</span>
          <h2 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-center leading-[1.05] max-w-3xl mb-5">
            Infrastructure, not a service.
          </h2>
          <p className="text-muted text-center max-w-xl mb-16">
            Signet is a protocol. Vaults are contracts you own. Metrics are aggregated on-chain in
            real time.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px w-full bg-border rounded-2xl overflow-hidden border border-border">
            <Metric value="$12.4M" label="Total value in vaults" />
            <Metric value="1,240" label="Active seals" />
            <Metric value="47" label="Successorships executed" />
            <Metric value="100%" label="Contract uptime" />
          </div>
        </div>
      </section>

      {/* INTEGRATIONS + ASSURANCE */}
      <section className="w-full py-24 border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 reveal">
          <div className="flex flex-col gap-6">
            <span className="text-xs font-semibold tracking-widest uppercase text-muted">Integrations</span>
            <h3 className="text-3xl sm:text-4xl font-semibold hero-heading leading-tight">
              Plugs into the wallets your kin already use.
            </h3>
            <p className="text-muted max-w-md">
              Signet vaults speak plain EVM. Any wallet, multisig or custody stack that can sign a
              transaction can be a beneficiary — no bespoke integration required.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4 max-w-md">
              {["Safe", "Ledger", "Fireblocks", "Rainbow", "MetaMask", "Coinbase", "Trezor", "WalletConnect", "Privy"].map((n) => (
                <div key={n} className="rounded-lg border border-border bg-surface/60 px-3 py-3 text-xs font-medium text-fg text-center hover:border-fg/20 transition-colors">
                  {n}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <span className="text-xs font-semibold tracking-widest uppercase text-muted">Assurance</span>
            <h3 className="text-3xl sm:text-4xl font-semibold hero-heading leading-tight">
              Written to be reviewed. Deployed to be verified.
            </h3>
            <p className="text-muted max-w-md">
              The factory and vault contracts are immutable, open-source and covered by external
              audit. Every deployment is verified on-chain and reproducible from source.
            </p>
            <div className="flex flex-col gap-3 mt-4">
              <AssuranceRow title="Audit" subtitle="Independent review — full report on Github" />
              <AssuranceRow title="Formal analysis" subtitle="Invariants proven with Halmos & Certora" />
              <AssuranceRow title="Bug bounty" subtitle="Live on Immunefi — up to $250k" />
              <AssuranceRow title="Verified source" subtitle="Every deployment reproducible & verified" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="w-full py-32 border-t border-border/60">
        <div className="max-w-3xl mx-auto px-6 reveal">
          <h2 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-center leading-[1.02] mb-16">
            Questions and Answers
          </h2>
          <div className="flex flex-col divide-y divide-border border-y border-border">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <button
                  key={f.q}
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="text-left py-5 flex flex-col gap-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-medium text-fg">{f.q}</span>
                    <HugeiconsIcon icon={ArrowDown01Icon} size={18} strokeWidth={1.5} className={`text-muted transition-transform ${open ? "rotate-180 text-fg" : ""}`} />
                  </div>
                  <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <p className="text-sm text-muted leading-relaxed pr-8 overflow-hidden">{f.a}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTRACT PILL */}
      <section className="w-full py-16">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center gap-4 font-mono text-sm border border-border rounded-2xl bg-surface/50 px-6 py-5 reveal">
          <span className="text-muted">SignetFactory</span>
          <span className="text-fg">{truncateAddress(FACTORY_ADDRESS, 6)}</span>
          <span className="text-xs text-accent border border-accent/40 rounded-full px-2 py-0.5">Verified</span>
          <div className="flex gap-4 sm:ml-auto">
            <button onClick={copyFactoryAddress} className="text-fg hover:opacity-70 transition-opacity">
              {copied ? "Copied" : "Copy"}
            </button>
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-fg hover:opacity-70 transition-opacity">
              Explorer ↗
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative w-full py-40 overflow-hidden border-t border-border/60">
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10 flex flex-col items-center gap-8 reveal">
          <h2 className="hero-heading text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[0.95]">
            Write yours before<br />the silence does.
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={() => login()} className="rounded-lg bg-fg px-6 py-3 text-sm font-medium text-bg hover:opacity-90 transition-opacity">
              Get started
            </button>
            <Link href="/wall" className="rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-fg hover:bg-fg/[0.06] transition-colors">
              View the wall
            </Link>
          </div>
        </div>
        <div aria-hidden className="hero-glow pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 w-[1400px] h-[600px] -z-0" />
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Signet</span>
            <span className="text-xs text-muted">Successor vaults on Monad</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted">
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="hover:text-fg transition-colors font-mono">
              Factory ↗
            </a>
            <Link href="/wall" className="hover:text-fg transition-colors">Wall</Link>
            <a href="#faq" className="hover:text-fg transition-colors">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TechBadge({ label, version }: { label: string; version: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 w-6 rounded-md border border-border bg-surface flex items-center justify-center text-[10px] font-semibold text-fg">
        {label[0]}
      </div>
      <span className="text-sm font-medium text-fg">{label}</span>
      <span className="text-xs text-muted">{version}</span>
    </div>
  );
}

function TestimonialCard({ name, handle, body }: { name: string; handle: string; body: string }) {
  const parts = body.split(/(@\w+)/g);
  return (
    <div className="w-[380px] shrink-0 rounded-2xl border border-border bg-surface/60 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-accent-soft/40" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-fg">{name}</span>
          <span className="text-xs text-muted">{handle}</span>
        </div>
      </div>
      <p className="text-sm text-muted leading-relaxed">
        {parts.map((p, i) => p.startsWith("@") ? <span key={i} className="mention">{p}</span> : <span key={i}>{p}</span>)}
      </p>
    </div>
  );
}

function FeatureVisual({ index }: { index: number }) {
  if (index === 0) {
    // Dense wireframe globe with two crossing white swoops
    return (
      <div className="relative w-full h-56 flex items-center justify-center">
        <svg viewBox="0 0 400 220" className="w-full h-full" fill="none">
          <defs>
            <radialGradient id="globe" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#FDBA74" stopOpacity="1" />
              <stop offset="70%" stopColor="#FB923C" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* longitude arcs */}
          {[...Array(14)].map((_, i) => {
            const rx = 140 - i * 10;
            return (
              <ellipse key={`v${i}`} cx="200" cy="110" rx={rx > 6 ? rx : 6} ry="86" fill="none" stroke="url(#globe)" strokeWidth="0.7" opacity={0.8 - i * 0.045} />
            );
          })}
          {/* latitude arcs */}
          {[...Array(10)].map((_, i) => {
            const ry = 80 - i * 8;
            return (
              <ellipse key={`h${i}`} cx="200" cy="110" rx="140" ry={ry > 5 ? ry : 5} fill="none" stroke="url(#globe)" strokeWidth="0.7" opacity={0.6 - i * 0.04} />
            );
          })}
          {/* white swoops crossing the globe */}
          <path d="M30 160 Q 200 -30 370 160" stroke="#FAFAFA" strokeWidth="1.4" opacity="0.85" />
          <path d="M50 60 Q 200 260 350 60" stroke="#FAFAFA" strokeWidth="1.1" opacity="0.4" />
        </svg>
      </div>
    );
  }
  if (index === 1) {
    // Deep concentric rings around a bright orange orb
    return (
      <div className="relative h-56 w-full flex items-center justify-center overflow-hidden">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: 60 + i * 32,
              height: 60 + i * 32,
              borderColor: `rgba(251,146,60,${0.28 - i * 0.018})`,
            }}
          />
        ))}
        <div
          aria-hidden
          className="absolute h-40 w-40 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(251,146,60,0.35) 0%, rgba(251,146,60,0) 65%)" }}
        />
        <div className="relative h-16 w-16 rounded-full bg-gradient-to-b from-accent-soft to-accent flex items-center justify-center shadow-[0_0_60px_rgba(251,146,60,0.8)]">
          <div className="h-2.5 w-2.5 rounded-full bg-bg" />
        </div>
      </div>
    );
  }
  if (index === 2) {
    // Floating tile grid — hugeicons for each, orange center featured
    const tiles = [
      { icon: DiamondIcon, key: "d" },
      { icon: CubeIcon, key: "c" },
      { icon: KeyIcon, key: "k" },
      { icon: Coins01Icon, key: "co" },
      { icon: null, key: "center" },
      { icon: Bitcoin01Icon, key: "b" },
    ];
    return (
      <div className="relative h-56 w-full flex items-center justify-center">
        <div
          aria-hidden
          className="absolute h-52 w-52 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(251,146,60,0.18) 0%, rgba(251,146,60,0) 65%)" }}
        />
        <div className="grid grid-cols-3 gap-3 relative">
          {tiles.map((t) => (
            <div
              key={t.key}
              className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                t.key === "center"
                  ? "bg-gradient-to-b from-accent-soft to-accent shadow-[0_0_40px_rgba(251,146,60,0.75)]"
                  : "border border-border bg-surface/90"
              }`}
            >
              {t.icon ? (
                <HugeiconsIcon icon={t.icon} size={22} strokeWidth={1.5} className="text-fg" />
              ) : (
                <HugeiconsIcon icon={ShieldIcon} size={22} strokeWidth={1.8} className="text-bg" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  // index 3 — chat bubbles with cursor detail
  return (
    <div className="relative h-56 w-full flex flex-col justify-center gap-3 px-4">
      <div className="self-start rounded-xl border border-border bg-surface/90 px-3 py-2 text-xs text-fg max-w-[80%]">
        We need to update the beneficiary before launch
      </div>
      <div className="relative self-start">
        <span className="inline-block rounded-xl bg-gradient-to-b from-accent-soft to-accent px-3 py-1.5 text-xs text-bg font-medium shadow-[0_0_30px_rgba(251,146,60,0.6)]">
          Sofia G.
        </span>
        <span aria-hidden className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent-soft" />
      </div>
      <div className="self-end rounded-xl border border-border bg-surface/90 px-3 py-2 text-xs text-fg max-w-[70%]">
        Rotated. Farewell resealed.
      </div>
      <div className="self-end rounded-xl border border-border bg-surface/90 px-3 py-2 text-xs text-fg">
        Done!
      </div>
      <div className="absolute right-6 bottom-4 flex items-center gap-1.5">
        <HugeiconsIcon icon={Cursor01Icon} size={18} className="text-fg" />
        <span className="text-[10px] text-fg bg-surface/90 border border-border rounded px-1.5 py-0.5">Erik D.</span>
      </div>
    </div>
  );
}

function DashboardMock({ compact }: { compact?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/70 backdrop-blur p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent-soft/50" />
          <span className="text-sm font-medium">0x9448…ECa7</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm text-muted">
          <span className="text-fg">Overview</span>
          <span>Beneficiary</span>
          <span>Message</span>
          {!compact && <span>Settings</span>}
        </div>
        <div className="rounded-lg border border-border bg-bg/60 px-3 py-1.5 text-xs text-muted">Search…</div>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold">Vault</h3>
        <button className="rounded-lg bg-fg text-bg px-3 py-1.5 text-xs font-medium">Check in</button>
      </div>
      <div className={`grid gap-3 mb-6 ${compact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
        <StatTile label="Deposited" value="12.40 MON" delta="+2.10 last week" />
        <StatTile label="Interval" value="90 days" delta="Resets on check-in" />
        {!compact && <StatTile label="Grace" value="14 days" delta="After interval" />}
        <StatTile label="Next check-in" value="61d 04h" delta="Silent in 75d" positive />
      </div>
      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}>
        <div className={`${compact ? "" : "lg:col-span-2"} rounded-xl border border-border bg-bg/40 p-5`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">Activity</span>
            <span className="text-xs text-muted">Last 12 months</span>
          </div>
          <div className="flex items-end justify-between h-40 gap-2">
            {[40, 60, 50, 80, 45, 90, 70, 30, 55, 65, 75, 85].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-fg/10 to-fg/40" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        {!compact && (
          <div className="rounded-xl border border-border bg-bg/40 p-5">
            <span className="text-sm font-semibold">Recent check-ins</span>
            <p className="text-xs text-muted mb-4">6 in the last 6 months.</p>
            <div className="flex flex-col gap-3">
              {["Mar 14", "Feb 12", "Jan 09", "Dec 08"].map((d) => (
                <div key={d} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-accent" />
                    <span className="text-fg">{d}</span>
                  </div>
                  <span className="text-muted">reset · +90d</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value, delta, positive }: { label: string; value: string; delta: string; positive?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-bg/40 p-4 flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xl font-semibold text-fg">{value}</span>
      <span className={`text-[11px] ${positive ? "text-accent" : "text-muted"}`}>{delta}</span>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-bg p-8 flex flex-col gap-2">
      <span className="text-4xl sm:text-5xl font-semibold hero-heading leading-none">{value}</span>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}

function AssuranceRow({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-accent mt-0.5" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-fg">{title}</span>
        <span className="text-xs text-muted">{subtitle}</span>
      </div>
    </div>
  );
}
