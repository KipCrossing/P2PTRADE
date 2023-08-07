<script lang="ts">
  import { SvelteUIProvider } from "@svelteuidev/core";
  import Entry from "./Entry.svelte";
  import "viem/window";

  export let title: string;

  export const ethereum = window.ethereum;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content="P2PTRADE | Decentralised Trading App" />
</svelte:head>

<SvelteUIProvider>
  {#if ethereum}
    <Entry {ethereum} />
  {:else}
    <div>No Wallet in browser</div>
  {/if}
</SvelteUIProvider>
