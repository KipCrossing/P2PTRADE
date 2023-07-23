<script lang="ts">
	import { onMount } from 'svelte';

	import { contractObject } from './contract';
	import { Contract, ethers, parseEther } from 'ethers';

	import type { StakedEscrow } from './types/StakedEscrow';

	const contractAddress = '0x8276EF08D33D4D805f1d19F00851023660c0ae13'
	const NO_ONE = "0x0000000000000000000000000000000000000000"

	const provider = new ethers.BrowserProvider(window.ethereum)
	// const stakedEscrowContract = new Contract(contractAddress, contractObject.abi, provider) as any as StakedEscrow

	let account: string | null = null
	let balance: string | null = null;
	

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


	let detailsErrorMsg: null | string = null;
	let escrowNum: null | number = null;

	let fetchedEscrow: null | {
		buyer: string;
		merchant: string;
		amount: bigint;
		details: string;
		isDead: boolean;
	} = null;

	async function getContractDetails() {
		detailsErrorMsg = null;
		if (!escrowNum) {
			console.log("Please enter escrow number")
			detailsErrorMsg = "Please enter escrow number"
			return
		}
		const signer = await provider.getSigner();
		const stakedEscrowContract = new ethers.Contract(contractAddress, contractObject.abi, signer) as any as StakedEscrow;
		const res = await stakedEscrowContract.escrows(escrowNum)
		if (res.merchant === NO_ONE) {
			console.log("Escrow does not exist")
			detailsErrorMsg = "Escrow does not exist"
			return
		}
		fetchedEscrow = res;
	}

	let details: null | string  = null;
	let escrowAmount: null | number = null;
	let createErrorMsg: null | string = null;
	let newEscrowNumber: null | number = null;

	async function createEscrow() {
		createErrorMsg = null;
		if (!details || !escrowAmount) {
			console.log("Please enter details and amount")
			createErrorMsg = "Please enter details and amount"
			return
		}
		const amount = ethers.parseEther(escrowAmount.toString());
		const signer = await provider.getSigner();
		// console.log(signer.address)
		// signer.sendTransaction({to: signer.address, value: amount})
		
		const stakedEscrowContract = new ethers.Contract(contractAddress, contractObject.abi, signer) as any as StakedEscrow;
		const tx = await stakedEscrowContract.createEscrow(amount, details, {
			value: ethers.parseEther((escrowAmount/4).toString()),
		})
		// TODO: add status messages for the transaction

		const receipt = await tx.wait();
		console.log("receipt", receipt);

		const EscrowCreatedEvent = stakedEscrowContract.filters['EscrowCreated(uint256,address,uint256)']
		const events = await stakedEscrowContract.queryFilter(EscrowCreatedEvent, receipt.blockNumber)
		console.log("events", events);
		// TODO: add some checks to make sure the event is the one we want

		const escrowID: bigint = events[0].args?._escrowId;

		console.log("escrowID", escrowID);
		newEscrowNumber = Number(escrowID);


		// const escrowCreatedEvent = receipt.events?.find(e => e.event === "EscrowCreated");
		// const escrowId = receipt.events?.find((e: any) => e.event === 'EscrowCreated')?.args?._escrowId;
  
	}

	
	

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
		{#if balance}
		<h2>
			Balance <strong>{balance}</strong>
		</h2>
		{/if}
		<br>
		<br>
		<br>
		<input bind:value={details} placeholder="Escrow details" />
		<input type="Amount" bind:value={escrowAmount} placeholder="Escrow amount" />
		<button on:click={createEscrow}>
			Create Escrow
		</button>
		{#if createErrorMsg}
		<p>{createErrorMsg}</p>
		{/if}
		<br>
		<input type="Escrow Number" bind:value={escrowNum} placeholder="Escrow amount" />
		<button on:click={getContractDetails}>
			Get Contract Details
		</button>
		{#if detailsErrorMsg}
		<p>{detailsErrorMsg}</p>
		{/if}
		{#if newEscrowNumber}
		<p>Escrow created with number {newEscrowNumber}</p>
		{/if}


	
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
	