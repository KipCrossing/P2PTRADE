<script lang="ts">
	import { onMount } from 'svelte';

	import { contractObject } from './contract';
	import { ethers } from 'ethers';

	const contractAddress = '0x8276EF08D33D4D805f1d19F00851023660c0ae13'

	let account: string | null = null
	let balance = "none";
	

	// @ts-ignore
	// defaultEvmStores.attachContract('StakedEscrow',contractAddress, contractObject.abi)

	async function getAccount() {
		const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
			.catch((err) => {
			if (err.code === 4001) {
				// EIP-1193 userRejectedRequest error
				// If this happens, the user rejected the connection request.
				console.log('Please connect to MetaMask.');
			} else {
				console.error(err);
			}
			});
		account = accounts[0];
	}
	

	onMount(() => {
		getAccount()
	})
	

	async function getBal() {
		const balHex = await window.ethereum.request({method: 'eth_getBalance', params: [account, 'latest']})
			.catch((err) => {
			if (err.code === 4001) {
				// EIP-1193 userRejectedRequest error
				// If this happens, the user rejected the connection request.
				console.log('Please connect to MetaMask.');
			} else {
				console.error(err);
			}
			});
		const balWei = parseInt(balHex, 16);
		balance = (balWei/10**18).toString();
	}



	
	
	</script>
	
	<svelte:head>
		<title>Home</title>
		<meta name="description" content="Trading App" />
	</svelte:head>
	
	<section>
		<h1>
			Trading app
		</h1>
	
		{#if !account}
	
		<p>My application is not yet connected</p>
	
		{:else}
	
		<p>Account {account}</p>
	
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
	
	
		<!-- {#if $contracts.StakedEscrow}
	
		{#await $contracts.StakedEscrow.methods.name().call()}
	
		<span>waiting...</span>
		
		{:then value}
		
		<span>Name: { value } </span>
		
		{/await}
	
		{:else}
	
		<p>Connecting to contract...</p>
	
	
		{/if} -->
	
	
	
	
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
	