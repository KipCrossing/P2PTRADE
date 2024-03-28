<script lang="ts">
  import { Container } from "@svelteuidev/core";
  import type { EIP1193Provider } from "viem";

  import { http, createWalletClient, custom, getContract } from "viem";
  import { contractAddress, xrpEVMDevNet } from "./utils/consts";
  import { abi } from "./types/abi";
  import { onMount } from "svelte";
  import Main from "./Main.svelte";

  export let ethereum: EIP1193Provider;

  let account: `0x${string}` | null = null;
  let message: string | null = null;

  async function getAccount() {
    account = null;
    const accounts = await ethereum
      .request({ method: "eth_requestAccounts" })
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log("Please connect to MetaMask.");
          message = "Please connect to MetaMask.";
        } else {
          console.error(err);
        }
      });
    if (!accounts) {
      return null;
    }
    account = accounts[0];
    return accounts[0];
  }

  async function requestChainChange() {
    const chainId = await ethereum.request({ method: "eth_chainId" });
    if (chainId === `0x${xrpEVMDevNet.id.toString(16)}`) {
      return chainId;
    }
    const chainIdNew = await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${xrpEVMDevNet.id.toString(16)}` }],
    });
    return chainIdNew;
  }

  onMount(() => {
    getAccount().then((account) => {
      console.log("account", account);
    });
    requestChainChange().then((chainId) => {
      console.log("chainId", chainId);
    });
    ethereum.on("accountsChanged", (accounts: string[]) => {
      console.log("accountsChanged", accounts);
      getAccount().then((account) => {
        console.log("account", account);
      });
    });
    ethereum.on("chainChanged", (chainId: string) => {
      console.log("chainChanged", chainId);
    });
    ethereum.on("connect", (connectInfo: { chainId: string }) => {
      console.log("connect", connectInfo);
    });
    ethereum.on("disconnect", (error: { code: number; message: string }) => {
      console.log("disconnect", error);
    });
  });
</script>

<Container size="xs" style="padding: 0px">
  {#if account}
    <div>
      <Main {ethereum} {account} />
    </div>
  {:else}
    <div>No Account Selected</div>
  {/if}
  {#if message}
    <div>
      message: {message}
    </div>
  {/if}
</Container>
