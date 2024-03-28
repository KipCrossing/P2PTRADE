import { defineChain } from "viem";

export const contractAddress: `0x${string}` =
  "0x8276EF08D33D4D805f1d19F00851023660c0ae13";
export const NO_ONE: `0x${string}` =
  "0x0000000000000000000000000000000000000000";

const xepdevnet = {
  id: 1440002,
  name: "XRPL EVM Sidechain Devnet",
  network: "XRPL EVM Sidechain Devnet",
  nativeCurrency: {
    name: "XRP",
    symbol: "XRP",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-evm-sidechain.xrpl.org"],
    },
    public: {
      http: ["https://rpc-evm-sidechain.xrpl.org"],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "EVM Sidechain Explorer",
      url: "https://evm-sidechain.xrpl.org",
    },
    default: {
      name: "EVM Sidechain Explorer",
      url: "https://evm-sidechain.xrpl.org",
    },
  },
  contracts: {},
};

export const xrpEVMDevNet = /*#__PURE__*/ defineChain(xepdevnet);
