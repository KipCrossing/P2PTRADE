import {
  createPublicClient,
  http,
  createWalletClient,
  custom,
  getContract,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import { contractAddress } from "./consts";
import { StakedEscrow__factory } from "../types";

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: custom(window.ethereum),
});

export function useContract(account: `0x${string}`) {
  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: custom(window.ethereum),
  });

  const contract = getContract({
    address: contractAddress,
    abi: StakedEscrow__factory.abi,
    publicClient,
    walletClient,
  });
  return contract;
}
