import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: Number(process.env.NEXT_PUBLIC_MONAD_CHAIN_ID ?? 10143),
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC ?? "https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});
