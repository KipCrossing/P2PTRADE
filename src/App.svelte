<script lang="ts">
  import {
    Affix,
    Container,
    SvelteUIProvider,
    Button,
    Modal,
  } from "@svelteuidev/core";
  import AccountInfo from "./components/AccountInfo.svelte";
  import CreateEscrowComp from "./components/CreateEscrowComp.svelte";
  import ViewEscrowComp from "./components/ViewEscrowComp.svelte";
  import AllEscrowComp from "./components/AllEscrowComp.svelte";

  const urlParams = new URLSearchParams(window.location.search);
  const escrowID: string | null = urlParams.get("escrowID") || null;

  let opened = false;

  function closeModal() {
    opened = false;
    window.location.reload();
  }
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Trading App" />
</svelte:head>

<SvelteUIProvider>
  <Modal {opened} on:close={closeModal} title="Create Escrow">
    <CreateEscrowComp />
  </Modal>
  <Container size="xs" override={{ px: "xs" }}>
    <h1>Trading app</h1>
    <Affix position={{ top: 20, right: 20 }}>
      <AccountInfo />
    </Affix>

    {#if escrowID}
      <ViewEscrowComp {escrowID} />
    {:else}
      <Button color="green" on:click={() => (opened = true)}>New escrow</Button>
      <br />
      <AllEscrowComp />
    {/if}
  </Container>
</SvelteUIProvider>
