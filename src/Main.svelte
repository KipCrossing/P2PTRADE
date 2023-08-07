<script lang="ts">
  import {
    Affix,
    Container,
    SvelteUIProvider,
    Button,
    Modal,
    Flex,
    Image,
  } from "@svelteuidev/core";

  import AccountInfo from "./components/AccountInfo.svelte";
  import CreateEscrowComp from "./components/CreateEscrowComp.svelte";
  import ViewEscrowComp from "./components/ViewEscrowComp.svelte";
  import AllEscrowComp from "./components/AllEscrowComp.svelte";
  import { Plus, CaretLeft } from "radix-icons-svelte";
  import type { EIP1193Provider } from "viem";

  export let ethereum: EIP1193Provider;
  export let account: `0x${string}`;

  const urlParams = new URLSearchParams(window.location.search);
  const escrowID: string | null = urlParams.get("escrowID") || null;

  let opened = false;

  function closeModal() {
    opened = false;
  }
</script>

<Modal {opened} on:close={closeModal} withCloseButton={false}>
  <CreateEscrowComp {ethereum} {account} />
</Modal>

<Container size="xs" override={{ px: "xs" }}>
  <div style="padding-top: 20px">
    <Flex justify="space-between">
      <div>
        <Image
          width="7 d0%"
          radius="md"
          src={"https://raw.githubusercontent.com/KipCrossing/P2PTRADE/929a14876e06c61024352c515baa18691dcb2d47/public/logo.svg"}
          alt="P2P Trade"
        />
        <p style="margin-top: 0;">Peer to peer trustless trade.</p>
      </div>
      <AccountInfo {ethereum} {account} />
    </Flex>
  </div>
  {#if escrowID}
    <Flex justify="space-between">
      <Button variant="subtle" href={window.location.href.split("?")[0]}
        ><CaretLeft slot="leftIcon" />Active Escrows</Button
      >
    </Flex>
    <br />
    <ViewEscrowComp {ethereum} {account} {escrowID} />
  {:else}
    <!-- <Button fullSize color="green" on:click={() => (opened = true)}>New escrow</Button> -->
    <Flex justify="space-between">
      <Button variant="subtle" color="green" on:click={() => (opened = true)}
        ><Plus slot="leftIcon" />New escrow</Button
      >
    </Flex>
    <AllEscrowComp {ethereum} {account} />
  {/if}
</Container>
