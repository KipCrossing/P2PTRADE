<script lang="ts">
  import { Badge, Button, Card, SvelteUIProvider } from "@svelteuidev/core";
  import { onMount } from "svelte";
  import { Modal, Group } from "@svelteuidev/core";
  import { Person } from "radix-icons-svelte";
  import {
    createPublicClient,
    createWalletClient,
    custom,
    type EIP1193Provider,
  } from "viem";
  import { sepolia } from "viem/chains";

  export let ethereum: EIP1193Provider;
  export let account: `0x${string}`;

  let opened = false;

  function closeModal() {
    opened = false;
  }

  let balance: number | null = null;

  onMount(() => {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: custom(ethereum),
    });

    publicClient.getBalance({ address: account }).then((balWei) => {
      balance = Number(balWei) / 10 ** 18;
    });

    // const walletClient = createWalletClient({
    //   account,
    //   chain: sepolia,
    //   transport: custom(ethereum),
    // });
  });
</script>

<SvelteUIProvider>
  <Group position="center">
    <Button
      radius="lg"
      size="xs"
      compact
      on:click={() => (opened = true)}
      color="dark"
    >
      <Person slot="leftIcon" />My Wallet</Button
    >
  </Group>
  <Modal {opened} on:close={closeModal} withCloseButton={false}>
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
