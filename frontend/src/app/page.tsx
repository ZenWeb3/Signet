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
  Home01Icon,
  Message01Icon,
  Time01Icon,
  Settings01Icon,
  Analytics01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { ArrowRightIcon } from "lucide-react";
import { useMySignets } from "@/lib/hooks";
import { monadTestnet } from "@/lib/chain";
import { FACTORY_ADDRESS } from "@/lib/contracts";
import { truncateAddress } from "@/lib/format";
import SignetNavbar from "@/components/SignetNavbar";
import Hero from "@/components/sections/hero/default";
import FAQ from "@/components/sections/faq/default";
import CTA from "@/components/sections/cta/default";
import FooterSection from "@/components/sections/footer/default";
import { Badge } from "@/components/ui/badge";
import { MockupFrame, Mockup } from "@/components/ui/mockup";
import Glow from "@/components/ui/glow";

const bigFeatures = [
  {
    title: "You hold the keys",
    body: "Every vault is a smart contract you deploy. Signet has no admin, no shared pool, no way to reach in. Your beneficiary doesn't even know they're on it until they need to be.",
  },
  {
    title: "The rules live in code",
    body: "Interval, grace period, beneficiary. All set when you deploy. All enforced by the contract. We can't change them for you. We can't change them against you either.",
  },
  {
    title: "Any wallet on the other end",
    body: "Point it at an address. That's it. MetaMask, Ledger, a Safe, another contract — anything that can sign a transaction can inherit.",
  },
  {
    title: "Say something first",
    body: "Attach a note. It's encrypted on your machine before it leaves. The key that decrypts it only surfaces once the claim goes through.",
  },
];

const grid = [
  {
    icon: ShieldIcon,
    title: "Guarded withdrawals",
    body: "Every path that moves money is reentrancy-locked.",
  },
  {
    icon: LockIcon,
    title: "Deployed once",
    body: "No admin key, no proxy, no self-destruct. What ships is what runs.",
  },
  {
    icon: Wallet01Icon,
    title: "Funds don't leave the vault",
    body: "They sit in the contract you own. Signet can't route them out.",
  },
  {
    icon: Clock01Icon,
    title: "Set your own clock",
    body: "Intervals from hours to years. Grace period on top.",
  },
  {
    icon: UserIcon,
    title: "Any address inherits",
    body: "Wallet, Safe, another contract, you choose. No integration needed.",
  },
  {
    icon: RefreshIcon,
    title: "Nothing is locked in",
    body: "Rotate the beneficiary, extend the clock, pull the money out. Anytime.",
  },
  {
    icon: GlobalIcon,
    title: "A public wall",
    body: "Opt-in feed of vaults that have gone quiet, live on chain.",
  },
  {
    icon: Mail01Icon,
    title: "One last message",
    body: "Encrypted before it leaves your machine. Unsealed on claim.",
  },
];

const testimonials = [
  {
    name: "Aria Chen",
    handle: "@ariachen",
    body: "spent an hour reading the contracts before i put anything in. small. legible. exactly what i wanted.",
  },
  {
    name: "Marcus Weld",
    handle: "@mweld",
    body: "took me five minutes to set up. my sister has no idea she's the beneficiary. that's kind of the point.",
  },
  {
    name: "Priya Ravel",
    handle: "@priyar",
    body: "the grace period matters more than i expected. took a two-week trip and didn't panic once.",
  },
  {
    name: "Julien Ostrom",
    handle: "@julostrm",
    body: "on-chain dead-man's switch that isn't a rug. finally.",
  },
  {
    name: "Nadia Karpov",
    handle: "@nadiakv",
    body: "moved a chunk of our cold storage into a signet vault as a backstop. cheaper than a lawyer.",
  },
  {
    name: "Toma Ives",
    handle: "@tomaives",
    body: "the wall is haunting. quiet, unopened vaults sitting on chain.",
  },
  {
    name: "Sana Delaroche",
    handle: "@sanadel",
    body: "estate planning where the paperwork is a contract you can read. that's the pitch. that's the whole pitch.",
  },
  {
    name: "Idris Halevy",
    handle: "@idrishh",
    body: "attaching a message is what pushed me from thinking about it to actually deploying one. small thing that matters.",
  },
  {
    name: "Zoe Marchetti",
    handle: "@zmarc",
    body: "rotated my beneficiary in one tx. no forms, no notary. felt weird how easy it was.",
  },
  {
    name: "Rafi Okonjo",
    handle: "@rafiokon",
    body: "auditor. ~400 lines. no admin key. does what it says.",
  },
];

const faqs = [
  {
    q: "What happens if I lose my wallet?",
    a: "The clock keeps counting. Once the interval and grace period both pass, the beneficiary you named can claim the vault.",
  },
  {
    q: "Can Signet shut this down?",
    a: "No. The factory and vault contracts are immutable — no admin key, no upgrade path, no self-destruct. If Signet disappeared tomorrow, the vaults would keep working.",
  },
  {
    q: "What if my beneficiary loses their wallet?",
    a: "You can rotate them any time before a claim starts. If nobody can claim and nobody rotates, the funds sit until someone can.",
  },
  {
    q: "Which chains?",
    a: "Monad testnet today. Mainnet Monad when the chain launches. Other EVM chains after that.",
  },
  {
    q: "Does Signet see my message?",
    a: "No. It's encrypted on your device before it leaves. The key only surfaces when the beneficiary's claim settles on chain.",
  },
];

const stepper = [
  {
    icon: DashboardSquare01Icon,
    title: "Set up the vault",
    body: "Interval, grace period, beneficiary. One screen. One transaction to deploy.",
  },
  {
    icon: Edit02Icon,
    title: "Write something",
    body: "Optional. Encrypted locally. Only your beneficiary sees it, and only after they claim.",
  },
  {
    icon: PaintBoardIcon,
    title: "Fund it, then live",
    body: "Deposit MON or any ERC-20. Top up whenever. The rest is checking in every so often.",
  },
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
  }, [
    ready,
    authenticated,
    address,
    mySignets.isLoading,
    mySignets.data,
    router,
  ]);

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
      {/* NAV — floating */}
      <SignetNavbar />

      <Hero
        title={
          <>
            The people you love shouldn&apos;t <em className="italic font-normal">lose</em> what you leave behind.
          </>
        }
        description="Keep your vault active with check-ins. If they stop, ownership passes to your beneficiary. Exactly as programmed."
        badge={
          <Badge variant="outline" className="animate-appear rounded-full">
            <span className="text-muted-foreground">Live on Monad testnet</span>
            <a href="#faq" className="flex items-center gap-1">
              Read more
              <ArrowRightIcon className="size-3" />
            </a>
          </Badge>
        }
        buttons={[
          { href: "#faq", text: "Get started", variant: "default" },
          {
            href: "https://github.com/zenweb3/signet",
            text: "Github",
            variant: "glow",
          },
        ]}
        mockup={
          <div className="animate-appear opacity-0 delay-700 w-full">
            <DashboardMock />
          </div>
        }
      />


      {/* BIG 2x2 FEATURE CARDS */}
      <section id="features" className="w-full pt-24 pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02] max-w-3xl mb-16 reveal">
            What happens
            <br />
            after you don&apos;t.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {bigFeatures.map((f, i) => (
              <div
                key={f.title}
                className="card relative rounded-2xl p-8 overflow-hidden min-h-[420px] flex flex-col reveal"
              >
                <div className="flex-1 flex items-center justify-center min-h-[220px]">
                  <FeatureVisual index={i} />
                </div>
                <div className="pt-8">
                  <h3 className="text-xl font-semibold text-fg mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ECLIPSE / SECURITY */}
      <section
        id="security"
        className="relative w-full overflow-hidden pt-40 pb-0 min-h-[1100px]"
      >
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-6 reveal">
          <h2 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02]">
            Short enough to
            <br />
            read in one sitting.
          </h2>
          <p className="text-muted max-w-lg mx-auto">
            The vault contract is about 400 lines. No admin key. No proxy. No
            self-destruct. If you want to trust it with money, you should be
            able to read it first — and you can.
          </p>
        </div>
        <div className="corona" style={{ top: "460px" }} />
      </section>

      {/* TABS: stepper with panel swap */}
      <section className="relative w-full py-32 border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20 reveal">
            <h2 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02]">
              Set it up in three screens.
            </h2>
            <p className="text-muted max-w-lg mx-auto mt-5">
              So when someone opens this in a year, or ten, there&apos;s
              something on the other side that feels like you meant it.
            </p>
          </div>
          <div className="grid lg:grid-cols-[minmax(280px,360px)_1fr] gap-10 items-start reveal">
            <div
              role="tablist"
              aria-orientation="vertical"
              className="flex flex-col gap-2"
            >
              {stepper.map((s, i) => {
                const active = activeStep === i;
                return (
                  <button
                    key={s.title}
                    role="tab"
                    aria-selected={active}
                    aria-controls={`impression-panel-${i}`}
                    onClick={() => setActiveStep(i)}
                    className={`text-left rounded-2xl p-5 transition-all duration-300 border ${
                      active
                        ? "border-border bg-surface"
                        : "border-transparent bg-transparent opacity-55 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <HugeiconsIcon
                        icon={s.icon}
                        size={18}
                        className={active ? "text-fg" : "text-muted"}
                      />
                      <span className="text-[15px] font-semibold">
                        {s.title}
                      </span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed pl-7">
                      {s.body}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-8 -z-10"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 55% at 50% 40%, rgba(251,146,60,0.18) 0%, rgba(251,146,60,0) 70%)",
                }}
              />
              <div
                key={activeStep}
                role="tabpanel"
                id={`impression-panel-${activeStep}`}
                className="tab-panel"
              >
                <ImpressionPanel step={activeStep} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8-GRID FEATURES */}
      <section className="w-full py-32 border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
          <h2 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-center leading-[1.02] max-w-2xl mb-16 reveal">
            Small, on purpose.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 w-full reveal">
            {grid.map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-fg">
                  <HugeiconsIcon
                    icon={item.icon}
                    size={18}
                    strokeWidth={1.5}
                    className="text-fg"
                  />
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — marquee */}
      <section className="w-full py-32 border-t border-border/60 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 flex flex-col items-center text-center mb-16 reveal">
          <h2 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02]">
            Loved by builders
            <br />
            across the network.
          </h2>
          <p className="text-muted mt-5">
            Here&apos;s what people are saying about Signet.
          </p>
        </div>
        <div className="marquee-mask flex flex-col gap-5">
          <div className="marquee-row">
            {[
              ...halfTestimonials,
              ...halfTestimonials,
              ...halfTestimonials,
            ].map((t, i) => (
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
          <span className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">
            Network
          </span>
          <h2 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-center leading-[1.05] max-w-3xl mb-5">
            Infrastructure, not a service.
          </h2>
          <p className="text-muted text-center max-w-xl mb-16">
            Signet is a protocol. Vaults are contracts you own. Metrics are
            aggregated on-chain in real time.
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
            <span className="text-xs font-semibold tracking-widest uppercase text-muted">
              Integrations
            </span>
            <h3 className="text-3xl sm:text-4xl font-semibold hero-heading leading-tight">
              Plugs into the wallets your kin already use.
            </h3>
            <p className="text-muted max-w-md">
              Signet vaults speak plain EVM. Any wallet, multisig or custody
              stack that can sign a transaction can be a beneficiary — no
              bespoke integration required.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4 max-w-md">
              {[
                "Safe",
                "Ledger",
                "Fireblocks",
                "Rainbow",
                "MetaMask",
                "Coinbase",
                "Trezor",
                "WalletConnect",
                "Privy",
              ].map((n) => (
                <div
                  key={n}
                  className="rounded-lg border border-border bg-surface/60 px-3 py-3 text-xs font-medium text-fg text-center hover:border-fg/20 transition-colors"
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <span className="text-xs font-semibold tracking-widest uppercase text-muted">
              What you can check
            </span>
            <h3 className="text-3xl sm:text-4xl font-semibold hero-heading leading-tight">
              Short. Immutable. Public.
            </h3>
            <p className="text-muted max-w-md">
              The vault contract is small enough to read before you trust it
              with anything. No admin key. No upgrade path. Live on Monad
              testnet, source-verified on the block explorer.
            </p>
            <div className="flex flex-col gap-3 mt-4">
              <AssuranceRow
                title="Immutable by design"
                subtitle="No admin, no proxy, no self-destruct in the contracts"
              />
              <AssuranceRow
                title="Source-verified on chain"
                subtitle="Read the factory and vaults on the Monad explorer"
              />
              <AssuranceRow
                title="Open source"
                subtitle="Every line on Github. Roughly 400 to read"
              />
            </div>
          </div>
        </div>
      </section>

      <div id="faq">
        <FAQ
          title="Questions and answers"
          items={faqs.map((f) => ({
            question: f.q,
            answer: <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">{f.a}</p>,
          }))}
        />
      </div>

      {/* CONTRACT PILL */}
      <section className="w-full py-16">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center gap-4 font-mono text-sm border border-border rounded-2xl bg-surface/50 px-6 py-5 reveal">
          <span className="text-muted">SignetFactory</span>
          <span className="text-fg">{truncateAddress(FACTORY_ADDRESS, 6)}</span>
          <span className="text-xs text-accent border border-accent/40 rounded-full px-2 py-0.5">
            Verified
          </span>
          <div className="flex gap-4 sm:ml-auto">
            <button
              onClick={copyFactoryAddress}
              className="text-fg hover:opacity-70 transition-opacity"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg hover:opacity-70 transition-opacity"
            >
              Explorer ↗
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <CTA
        title="Write yours before the silence does."
        buttons={[
          { href: "#faq", text: "Get started", variant: "default" },
          { href: "/wall", text: "View the wall", variant: "glow" },
        ]}
      />

      {/* FOOTER */}
      <FooterSection
        logo={null}
        name="Signet"
        columns={[
          {
            title: "Product",
            links: [
              { text: "Features", href: "#features" },
              { text: "Security", href: "#security" },
              { text: "Network", href: "#network" },
              { text: "The Wall", href: "/wall" },
            ],
          },
          {
            title: "Contract",
            links: [
              { text: "Factory on Explorer", href: explorerUrl },
              { text: "Github", href: "https://github.com" },
              { text: "FAQ", href: "#faq" },
            ],
          },
          {
            title: "Resources",
            links: [
              { text: "Monad testnet", href: "https://testnet.monadexplorer.com" },
              { text: "Public wall", href: "/wall" },
            ],
          },
        ]}
        copyright={`© ${new Date().getFullYear()} Signet · Successor vaults on Monad`}
        policies={[
          { text: "Privacy", href: "#" },
          { text: "Terms", href: "#" },
        ]}
        showModeToggle={false}
      />
    </div>
  );
}

function TestimonialCard({
  name,
  handle,
  body,
}: {
  name: string;
  handle: string;
  body: string;
}) {
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
        {parts.map((p, i) =>
          p.startsWith("@") ? (
            <span key={i} className="mention">
              {p}
            </span>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
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
              <ellipse
                key={`v${i}`}
                cx="200"
                cy="110"
                rx={rx > 6 ? rx : 6}
                ry="86"
                fill="none"
                stroke="url(#globe)"
                strokeWidth="0.7"
                opacity={0.8 - i * 0.045}
              />
            );
          })}
          {/* latitude arcs */}
          {[...Array(10)].map((_, i) => {
            const ry = 80 - i * 8;
            return (
              <ellipse
                key={`h${i}`}
                cx="200"
                cy="110"
                rx="140"
                ry={ry > 5 ? ry : 5}
                fill="none"
                stroke="url(#globe)"
                strokeWidth="0.7"
                opacity={0.6 - i * 0.04}
              />
            );
          })}
          {/* white swoops crossing the globe */}
          <path
            d="M30 160 Q 200 -30 370 160"
            stroke="#FAFAFA"
            strokeWidth="1.4"
            opacity="0.85"
          />
          <path
            d="M50 60 Q 200 260 350 60"
            stroke="#FAFAFA"
            strokeWidth="1.1"
            opacity="0.4"
          />
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
          style={{
            background:
              "radial-gradient(circle, rgba(251,146,60,0.35) 0%, rgba(251,146,60,0) 65%)",
          }}
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
          style={{
            background:
              "radial-gradient(circle, rgba(251,146,60,0.18) 0%, rgba(251,146,60,0) 65%)",
          }}
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
                <HugeiconsIcon
                  icon={t.icon}
                  size={22}
                  strokeWidth={1.5}
                  className="text-fg"
                />
              ) : (
                <HugeiconsIcon
                  icon={ShieldIcon}
                  size={22}
                  strokeWidth={1.8}
                  className="text-bg"
                />
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
        <span
          aria-hidden
          className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent-soft"
        />
      </div>
      <div className="self-end rounded-xl border border-border bg-surface/90 px-3 py-2 text-xs text-fg max-w-[70%]">
        Rotated. Farewell resealed.
      </div>
      <div className="self-end rounded-xl border border-border bg-surface/90 px-3 py-2 text-xs text-fg">
        Done!
      </div>
      <div className="absolute right-6 bottom-4 flex items-center gap-1.5">
        <HugeiconsIcon icon={Cursor01Icon} size={18} className="text-fg" />
        <span className="text-[10px] text-fg bg-surface/90 border border-border rounded px-1.5 py-0.5">
          Erik D.
        </span>
      </div>
    </div>
  );
}

function ImpressionPanel({ step }: { step: number }) {
  if (step === 0) {
    // Configure the seal — form-style config
    return (
      <div className="rounded-2xl border border-border bg-surface backdrop-blur p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-xs text-muted">Step 1</span>
            <h3 className="text-lg font-semibold">Configure the seal</h3>
          </div>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted font-mono">draft</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <FormField label="Check-in interval" value="90 days" />
          <FormField label="Grace period" value="14 days" />
          <FormField label="Beneficiary" value="0x9448…ECa7" mono />
          <FormField label="Chain" value="Monad testnet" />
        </div>
        <div className="rounded-xl border border-border bg-bg/40 p-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-muted mb-1">Silent after</div>
            <div className="text-xl font-semibold">104 days</div>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex-1">
            <div className="text-xs text-muted mb-1">Deploy cost</div>
            <div className="text-xl font-semibold">~0.006 MON</div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-5">
          <button className="rounded-lg border border-border bg-bg/40 px-3 py-1.5 text-xs text-fg">Preview</button>
          <button className="rounded-lg bg-fg text-bg px-3 py-1.5 text-xs font-medium">Deploy vault</button>
        </div>
      </div>
    );
  }
  if (step === 1) {
    // Attach a farewell — message editor with encrypted preview
    return (
      <div className="rounded-2xl border border-border bg-surface backdrop-blur p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col">
            <span className="text-xs text-muted">Step 2</span>
            <h3 className="text-lg font-semibold">Farewell — draft</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] rounded-full border border-brand-fg/40 text-brand-fg px-2 py-0.5">Encrypted</span>
            <span className="text-[10px] text-muted font-mono">AES-256-GCM</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-bg/40 p-5 mb-4">
          <p className="text-sm text-fg leading-relaxed">
            If you&apos;re reading this, my clock ran out. There&apos;s a small
            box in the second drawer of the desk — the key is with your mother.
          </p>
          <p className="text-sm text-fg leading-relaxed mt-3">
            Everything I meant to say, I meant twice.
          </p>
          <p className="text-sm text-muted italic mt-3">— for E.</p>
        </div>
        <div className="rounded-xl border border-border bg-bg/40 p-4 flex items-center gap-3 mb-4">
          <span className="text-[10px] uppercase tracking-widest text-muted">On-chain payload</span>
          <span className="text-xs font-mono text-fg/70 truncate">0x74a8…c9f2 · 328 bytes</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Only decrypts when the vault is claimed.</span>
          <button className="rounded-lg border border-border bg-bg/40 px-3 py-1.5 text-fg">Seal</button>
        </div>
      </div>
    );
  }
  // Step 2 — Fund and forget
  return (
    <div className="rounded-2xl border border-border bg-surface backdrop-blur p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-xs text-muted">Step 3</span>
          <h3 className="text-lg font-semibold">Fund the vault</h3>
        </div>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted font-mono">gas ≈ 0.0004</span>
      </div>
      <div className="rounded-xl border border-border bg-bg/40 p-5 mb-4">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs text-muted">Amount</span>
          <span className="text-xs text-muted">Balance 42.18 MON</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-4xl font-semibold text-fg">12.40</span>
          <div className="flex items-center gap-2 rounded-lg border border-border px-2 py-1">
            <div className="h-5 w-5 rounded-full bg-linear-to-br from-brand to-brand-fg/60" />
            <span className="text-sm font-medium">MON</span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {["25%", "50%", "Max"].map((p) => (
            <button key={p} className="rounded-md border border-border bg-bg/40 px-2 py-1 text-[11px] text-muted hover:text-fg transition-colors">
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatTile label="Split payout" value="Single" delta="One beneficiary" />
        <StatTile label="Claim delay" value="Instant" delta="Once eligible" positive />
      </div>
      <button className="w-full rounded-lg bg-fg text-bg px-4 py-3 text-sm font-medium">Fund vault</button>
    </div>
  );
}

function FormField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-bg/40 px-4 py-3 flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-widest text-muted">{label}</span>
      <span className={`text-sm text-fg ${mono ? "font-mono" : "font-medium"}`}>{value}</span>
    </div>
  );
}

function DashboardMock({ compact }: { compact?: boolean }) {
  const nav = [
    { icon: Home01Icon, label: "Overview", active: true },
    { icon: UserIcon, label: "Beneficiary" },
    { icon: Message01Icon, label: "Farewell" },
    { icon: Time01Icon, label: "Timeline" },
    { icon: Analytics01Icon, label: "Activity" },
    { icon: Settings01Icon, label: "Settings" },
  ];

  const bars = [
    { h: 42, color: "muted" },
    { h: 58, color: "muted" },
    { h: 50, color: "muted" },
    { h: 78, color: "brand-soft" },
    { h: 45, color: "muted" },
    { h: 92, color: "brand" },
    { h: 68, color: "brand-soft" },
    { h: 30, color: "muted" },
    { h: 54, color: "muted" },
    { h: 66, color: "brand-soft" },
    { h: 74, color: "muted" },
    { h: 82, color: "brand-soft" },
  ];

  const barBg = (c: string) => {
    if (c === "brand")
      return "linear-gradient(to top, rgba(251,146,60,0.4), #fb923c)";
    if (c === "brand-soft")
      return "linear-gradient(to top, rgba(251,146,60,0.15), rgba(253,186,116,0.75))";
    return "linear-gradient(to top, rgba(250,250,250,0.06), rgba(250,250,250,0.28))";
  };

  return (
    <div
      className="rounded-2xl border border-border p-2 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.95)]"
      style={{ background: "#050507" }}
    >
      <div className="flex gap-2">
        {/* Sidebar */}
        <aside
          className="hidden sm:flex flex-col gap-1 shrink-0 rounded-xl p-3"
          style={{ width: compact ? 168 : 200, background: "#0a0a0d" }}
        >
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <div className="h-7 w-7 rounded-md bg-linear-to-br from-brand-soft to-brand-fg flex items-center justify-center text-bg text-[11px] font-bold">
              S
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-fg">Signet</span>
              <span className="text-[10px] text-muted">Vault #0142</span>
            </div>
          </div>
          {nav.map((n) => (
            <div
              key={n.label}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
                n.active
                  ? "bg-fg/[0.06] text-fg"
                  : "text-muted hover:text-fg"
              }`}
            >
              <HugeiconsIcon
                icon={n.icon}
                size={16}
                strokeWidth={1.5}
                className={n.active ? "text-fg" : "text-muted"}
              />
              <span>{n.label}</span>
              {n.active && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full"
                  style={{ background: "#fb923c" }}
                />
              )}
            </div>
          ))}
          <div className="mt-auto rounded-lg border border-border p-3 mt-4">
            <div className="text-[11px] text-muted mb-1">Beneficiary</div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-linear-to-br from-brand-fg to-brand-soft/50" />
              <span className="text-[11px] font-mono text-fg">
                0xE1a7…c9F2
              </span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main
          className="flex-1 rounded-xl p-5"
          style={{ background: "#0a0a0d" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Search01Icon}
                size={14}
                className="text-muted"
              />
              <input
                readOnly
                value="Search vault activity…"
                className="text-xs text-muted bg-transparent outline-none w-56"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-border bg-bg/40 px-2.5 py-1.5 text-[11px] text-muted">
                Jan 20 – Feb 09
              </button>
              <button
                className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-bg"
                style={{
                  background: "linear-gradient(180deg, #fdba74, #fb923c)",
                  boxShadow: "0 8px 24px -6px rgba(251,146,60,0.6)",
                }}
              >
                Check in
              </button>
            </div>
          </div>

          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h3 className="text-2xl font-semibold text-fg">Overview</h3>
              <p className="text-xs text-muted">Vault sealed 214 days ago.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#22c55e" }}
              />
              <span className="text-[11px] text-muted">Active</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatTile
              label="Deposited"
              value="12.40 MON"
              delta="+2.10 last week"
            />
            <StatTile
              label="Interval"
              value="90 days"
              delta="Resets on check-in"
            />
            {!compact && (
              <StatTile
                label="Grace"
                value="14 days"
                delta="After interval"
              />
            )}
            <StatTile
              label="Next check-in"
              value="61d 04h"
              delta="Silent in 75d"
              positive
            />
          </div>

          <div
            className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}
          >
            <div
              className={`${compact ? "" : "lg:col-span-2"} rounded-xl border border-border p-5`}
              style={{ background: "#050507" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Check-in cadence</span>
                  <span className="text-[11px] text-muted">
                    Monthly, last 12 months
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted">
                  <LegendDot color="#fb923c" label="On-time" />
                  <LegendDot color="rgba(253,186,116,0.75)" label="Grace" />
                  <LegendDot color="rgba(250,250,250,0.28)" label="Idle" />
                </div>
              </div>
              <div className="flex items-end justify-between h-40 gap-2">
                {bars.map((b, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${b.h}%`,
                      background: barBg(b.color),
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted mt-2">
                {"J F M A M J J A S O N D".split(" ").map((m, i) => (
                  <span key={i} className="flex-1 text-center">
                    {m}
                  </span>
                ))}
              </div>
            </div>
            {!compact && (
              <div
                className="rounded-xl border border-border p-5"
                style={{ background: "#050507" }}
              >
                <span className="text-sm font-semibold">Recent check-ins</span>
                <p className="text-[11px] text-muted mb-4">
                  6 in the last 6 months.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { d: "Mar 14", note: "reset · +90d" },
                    { d: "Feb 12", note: "reset · +90d" },
                    { d: "Jan 09", note: "reset · +90d" },
                    { d: "Dec 08", note: "reset · +90d" },
                  ].map((r) => (
                    <div
                      key={r.d}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={CheckmarkCircle01Icon}
                          size={14}
                          className="text-brand-fg"
                        />
                        <span className="text-fg">{r.d}</span>
                      </div>
                      <span className="text-muted">{r.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      <span>{label}</span>
    </div>
  );
}

function StatTile({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg/40 p-4 flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xl font-semibold text-fg">{value}</span>
      <span
        className={`text-[11px] ${positive ? "text-accent" : "text-muted"}`}
      >
        {delta}
      </span>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-bg p-8 flex flex-col gap-2">
      <span className="text-4xl sm:text-5xl font-semibold hero-heading leading-none">
        {value}
      </span>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}

function AssuranceRow({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
      <HugeiconsIcon
        icon={CheckmarkCircle01Icon}
        size={16}
        className="text-accent mt-0.5"
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-fg">{title}</span>
        <span className="text-xs text-muted">{subtitle}</span>
      </div>
    </div>
  );
}
