import { createPublicClient, http, createWalletClient, custom } from "viem";
import { mainnet, sepolia } from "viem/chains";

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: custom(window.ethereum),
});

export const walletClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum),
});
