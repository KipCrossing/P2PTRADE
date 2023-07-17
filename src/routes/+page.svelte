<script>
  import { onMount } from 'svelte';
import {
  connected,
  web3,
  selectedAccount,
  chainId,
  chainData
} from 'svelte-web3'

import { defaultEvmStores } from 'svelte-web3'

onMount(() => {
  // add a test to return in SSR context
  defaultEvmStores.setProvider()
})

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>
		Traiding app
	</h1>

	<h2>
		Example <strong>strong text</strong>
	</h2>

</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

</style>
