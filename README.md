# Signet

**An on-chain successor vault.** Deposit crypto you want to leave behind, name a beneficiary, set a check-in cadence. As long as you check in, the funds are yours. If you go silent past your grace period, the beneficiary can claim what's inside and unlock your farewell message.

> The crypto will nobody has written.

Live on Monad testnet.

---

## What's in the box

Two small Solidity contracts and a Next.js frontend.

```
signet/
├── contracts/       Foundry project (SignetFactory + Signet)
└── frontend/        Next.js 16 app (landing, setup flow, vault dashboard, public wall)
```

---

## How it works

1. **Deploy your vault.** `SignetFactory.createSignet(beneficiary, label, checkInInterval, gracePeriod, farewell)` deploys a `Signet` at a deterministic CREATE2 address. `msg.sender` becomes owner.
2. **Fund it.** Deposit native MON (`deposit()`) or any ERC-20 (`depositToken`).
3. **Check in.** Owner calls `checkIn()` before each interval expires. The clock resets.
4. **If you don't.** Once `lastCheckIn + checkInInterval + gracePeriod < block.timestamp`, the beneficiary can `claim()`. On claim, funds transfer, the farewell message unseals, and the vault is done.

### Guardrails

| Constant | Value | Why |
|---|---|---|
| `MIN_INTERVAL` | 1 day | No accidental instant expiration |
| `MAX_INTERVAL` | 5 years | Bound liveness expectations |
| `MIN_GRACE` | 1 day | Real-life buffer |
| `MAX_GRACE` | 365 days | Bound the wait |
| `MAX_FAREWELL_LENGTH` | 500 chars | Keep gas bounded |
| `WARNING_WINDOW` | 7 days | UI hint before the interval fires |

### Vault lifecycle

`HEALTHY → WARNING → GRACE → CLAIMABLE → CLAIMED`

The frontend derives state from `lastCheckIn`, `checkInInterval`, `gracePeriod`, and `claimed` — see `frontend/src/lib/contracts.ts`.

---

## Contracts

Foundry project in `contracts/`. Uses OpenZeppelin `ReentrancyGuard` and `SafeERC20`.

```bash
cd contracts
forge install
forge build
forge test
```

### Deploy

Set your deployer private key and run the script:

```bash
export MONAD_RPC=https://testnet-rpc.monad.xyz
export DEPLOYER_PRIVATE_KEY=0x...
forge script script/DeployFactory.s.sol --rpc-url $MONAD_RPC --broadcast --private-key $DEPLOYER_PRIVATE_KEY
```

### Deployed (Monad testnet)

- **Chain ID:** `10143`
- **SignetFactory:** [`0x9D4e1273F1Dc299FaE9Bf79F0F48B399da402149`](https://testnet.monadexplorer.com/address/0x9D4e1273F1Dc299FaE9Bf79F0F48B399da402149)

### Guarantees

- **Immutable.** No admin key, no proxy, no self-destruct.
- **Reentrancy-locked.** `withdraw`, `withdrawToken`, and `claim` all use `nonReentrant`.
- **Non-custodial.** Every vault is its own contract. Signet holds nothing.

---

## Frontend

```bash
cd frontend
pnpm install
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_PRIVY_APP_ID from privy.io
pnpm dev
```

Open http://localhost:3000.

### Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS 4**
- **wagmi v3 + viem** for chain calls
- **Privy** for auth (email + embedded wallet, or bring your own)
- **hugeicons-react** for iconography
- **Inter** for display + body, **JetBrains Mono** for addresses

### Pages

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/setup` | Deploy a new vault (interval, grace, beneficiary, farewell) |
| `/vault` | Owner dashboard (check in, top up, rotate beneficiary) |
| `/claim/[signet]` | Beneficiary claim flow |
| `/wall` | Public feed of vaults, live from chain |
| `/settings` | Advanced controls |

---

## Environment

```bash
NEXT_PUBLIC_MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_MONAD_CHAIN_ID=10143
NEXT_PUBLIC_SIGNET_FACTORY_ADDRESS=0x9D4e1273F1Dc299FaE9Bf79F0F48B399da402149
NEXT_PUBLIC_PRIVY_APP_ID=      # from privy.io
```

---

## License

Signet's contracts and app code are **MIT** licensed.

