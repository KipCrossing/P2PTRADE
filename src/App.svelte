<script lang="ts">
  import {
    Affix,
    Container,
    SvelteUIProvider,
    Button,
    Modal,
    Flex
  } from "@svelteuidev/core";

  import AccountInfo from "./components/AccountInfo.svelte";
  import CreateEscrowComp from "./components/CreateEscrowComp.svelte";
  import ViewEscrowComp from "./components/ViewEscrowComp.svelte";
  import AllEscrowComp from "./components/AllEscrowComp.svelte";
  import { Plus, CaretLeft } from 'radix-icons-svelte';

  export let title: string;
  const urlParams = new URLSearchParams(window.location.search);
  const escrowID: string | null = urlParams.get("escrowID") || null;

  let opened = false;

  function closeModal() {
    opened = false;
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content="Trading App" />
</svelte:head>

<SvelteUIProvider>

  <Affix position={{ top: 20, right: 20 }}>
    <AccountInfo />
  </Affix>


  <Modal {opened} on:close={closeModal} withCloseButton={false}>
    <CreateEscrowComp />
  </Modal>

  <Container size="xs" override={{ px: "xs" }}>
    <div style="padding-bottom: 10px">
    <h1 style="margin-bottom: 0px;">Trading App</h1>
    <small>A lightweight & decentralised peer to peer trading app.</small>
  </div>
    {#if escrowID}
    <Flex justify="space-between">
      <Button variant="subtle" href={window.location.href.split("?")[0]}><CaretLeft slot="leftIcon" />Active Escrows</Button>
    </Flex>
      <br />
      <ViewEscrowComp {escrowID} />
    {:else}
      <!-- <Button fullSize color="green" on:click={() => (opened = true)}>New escrow</Button> -->
      <Flex justify="space-between">
        <Button variant="subtle" color="green" on:click={() => (opened = true)}><Plus slot="leftIcon" />New escrow</Button>
      </Flex>
        <br />
      <AllEscrowComp />
    {/if}
  </Container>
</SvelteUIProvider>

