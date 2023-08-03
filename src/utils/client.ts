import {
  createPublicClient,
  http,
  createWalletClient,
  custom,
  getContract,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import { contractAddress } from "./consts";
import { abi } from "../types/abi";

// @ts-ignore
export const ethereum = window.ethereum;

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: custom(ethereum),
});

export function useContract(account: `0x${string}`) {
  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: custom(ethereum),
  });

  const contract = getContract({
    address: contractAddress,
    abi: abi,
    publicClient,
    walletClient,
  });
  return contract;
}
