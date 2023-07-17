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
import { contractObject } from '../utils/contract';


const JsonStrign = JSON.stringify(contractObject.abi)
const contractAddress = '0x8276EF08D33D4D805f1d19F00851023660c0ae13'

// @ts-ignore
defaultEvmStores.attachContract('myContract',contractAddress, contractObject.abi)

onMount(() => {
	// add a test to return in SSR context
	defaultEvmStores.setProvider()
	
})


let balance = 0;

async function getBal() {
	if (selectedAccount){
		const wei = await $web3.eth.getBalance($selectedAccount)
		balance = $web3.utils.fromWei(wei, 'ether')
	}
}




</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Trading App" />
</svelte:head>

<section>
	<h1>
		Traiding app
	</h1>

	{#if !$connected}

	<p>My application is not yet connected</p>

	{:else}

	<p>Connected to chain with id {$chainId}</p>
	<p>Account {$selectedAccount}</p>

	{/if}

	<h2>
		Example <strong>strong text</strong>
	</h2>
	<button on:click={getBal}>
		Get balance
	</button>
	<h2>
		Balance <strong>{balance}</strong>
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
