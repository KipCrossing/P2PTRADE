<script lang="ts">
  import { Badge, Button, Card, SvelteUIProvider } from "@svelteuidev/core";
  import { onMount } from "svelte";
  import { Modal, Group } from '@svelteuidev/core';
  import { Person} from 'radix-icons-svelte';

  let opened = false;

  function closeModal() {
    opened = false;
  }

  $: account = null;
  $: balance = null;

  async function getBal() {
    console.log("account", account);
    const balHex = await window.ethereum
      .request({ method: "eth_getBalance", params: [account, "latest"] })
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log("Please connect to MetaMask.");
          return null;
        } else {
          console.error(err);
          return null;
        }
      });
    const balWei = parseInt(balHex, 16);
    console.log("balWei", balWei);
    balance = (balWei / 10 ** 18).toString();
  }

  async function getAccount() {
    const accounts = await window.ethereum
      .request({ method: "eth_requestAccounts" })
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log("Please connect to MetaMask.");
        } else {
          console.error(err);
        }
      });
    account = accounts[0];
  }

  onMount(() => {
    getAccount().then(() => {
      getBal();
    });
  });
</script>

<SvelteUIProvider>
<Group position="center">
	<Button variant='default' compact on:click={() => (opened = true)} color="dark">
    <Person slot="leftIcon" />My Wallet</Button>
</Group>
<Modal  {opened} on:close={closeModal} withCloseButton={false}>
    <h3>Account Information</h3>
    {#if !account || !balance}
      <Badge variant="filled" color={"red"}>not connected</Badge>
    {:else}
      <Badge variant="filled">{account}</Badge>
      <p>
        Balance: <strong>{balance}</strong>
      </p>
    {/if}
</Modal>
</SvelteUIProvider>

<!-- <Card shadow="sm" padding="lg">
  <h3>Account Information</h3>
  {#if !account || !balance}
    <Badge variant="filled" color={"red"}>not connected</Badge>
  {:else}
    <Badge variant="filled">{account}</Badge>
    <p>
      Balance: <strong>{balance}</strong>
    </p>
  {/if}
</Card> -->
