<script lang="ts">
  import { Affix, Container, SvelteUIProvider } from "@svelteuidev/core";
  import AccountInfo from "./components/AccountInfo.svelte";
  import CreateEscrowComp from "./components/CreateEscrowComp.svelte";
  import ViewEscrowComp from "./components/ViewEscrowComp.svelte";

  const urlParams = new URLSearchParams(window.location.search);
  const escrowID: string | null = urlParams.get("escrowID") || null;
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Trading App" />
</svelte:head>

<SvelteUIProvider>
  <Container size="xs" override={{ px: "xs" }}>
    <h1>Trading app</h1>
    <Affix position={{ top: 20, right: 20 }}>
      <AccountInfo />
    </Affix>

    {#if escrowID}
      <ViewEscrowComp {escrowID} />
    {:else}
      <CreateEscrowComp />
    {/if}
  </Container>
</SvelteUIProvider>
