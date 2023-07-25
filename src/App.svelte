<script lang="ts">
  import { Affix, Container, SvelteUIProvider } from "@svelteuidev/core";
  import { Button } from "@svelteuidev/core";
  import { Alert } from "@svelteuidev/core";
  import { onMount } from "svelte";

  import { contractObject } from "./contract";
  import { Contract, ethers, parseEther } from "ethers";

  import type { StakedEscrow } from "./types/StakedEscrow";

  import AccountInfo from "./components/AccountInfo.svelte";
  import CreateEscrowComp from "./components/ViewEscrowComp.svelte";

  import { NO_ONE, contractAddress } from "./utils/consts";

  const urlParams = new URLSearchParams(window.location.search);
  const escrowID: string | null = urlParams.get("escrowID") || null;

  const provider = new ethers.BrowserProvider(window.ethereum);
  // const stakedEscrowContract = new Contract(contractAddress, contractObject.abi, provider) as any as StakedEscrow

  onMount(() => {
    if (escrowID) {
      getContractDetails();
    }
  });

  let detailsErrorMsg: null | string = null;

  let fetchedEscrow: null | {
    buyer: string;
    merchant: string;
    amount: bigint;
    details: string;
    isDead: boolean;
  } = null;

  async function getContractDetails() {
    detailsErrorMsg = null;
    let escrowNum = null;
    try {
      escrowNum = Number(escrowID);
    } catch (e) {
      console.log("Please enter a valid escrow number");
      detailsErrorMsg = "Please enter a valid escrow number";
      return;
    }
    if (!escrowNum) {
      console.log("Please enter escrow number");
      detailsErrorMsg = "Please enter escrow number";
      return;
    }
    const signer = await provider.getSigner();
    const stakedEscrowContract = new ethers.Contract(
      contractAddress,
      contractObject.abi,
      signer
    ) as any as StakedEscrow;
    const res = await stakedEscrowContract.escrows(escrowNum);
    if (res.merchant === NO_ONE) {
      console.log("Escrow does not exist");
      detailsErrorMsg = "Escrow does not exist";
      return;
    }
    fetchedEscrow = res;
  }

  let details: null | string = null;
  let escrowAmount: null | number = null;
  let createErrorMsg: null | string = null;
  let createProgressMsg: null | string = null;
  let newEscrowNumber: null | number = null;

  async function createEscrow() {
    createErrorMsg = null;
    createProgressMsg = "Creating escrow...";
    if (!details || !escrowAmount) {
      console.log("Please enter details and amount");
      createErrorMsg = "Please enter details and amount";
      createProgressMsg = null;
      return;
    }
    const amount = ethers.parseEther(escrowAmount.toString());
    const signer = await provider.getSigner();
    // console.log(signer.address)
    // signer.sendTransaction({to: signer.address, value: amount})

    const stakedEscrowContract = new ethers.Contract(
      contractAddress,
      contractObject.abi,
      signer
    ) as any as StakedEscrow;
    const tx = await stakedEscrowContract.createEscrow(amount, details, {
      value: ethers.parseEther((escrowAmount / 4).toString()),
    });
    createProgressMsg =
      "Escrow request signed and sent. Waiting for confirmation...";
    // TODO: add status messages for the transaction

    const receipt = await tx.wait();
    console.log("receipt", receipt);

    createProgressMsg = `Escrow created in block ${receipt.blockNumber}`;

    const EscrowCreatedEvent =
      stakedEscrowContract.filters["EscrowCreated(uint256,address,uint256)"];
    const events = await stakedEscrowContract.queryFilter(
      EscrowCreatedEvent,
      receipt.blockNumber
    );
    console.log("events", events);
    // TODO: add some checks to make sure the event is the one we want

    const escrowID: bigint = events[0].args?._escrowId;

    console.log("escrowID", escrowID);
    newEscrowNumber = Number(escrowID);
    createProgressMsg = null;
  }
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
      <h2>Buyer Portal</h2>
      {#if fetchedEscrow}
        <p>merchant: {fetchedEscrow.merchant}</p>
        <p>buyer: {fetchedEscrow.buyer}</p>
        <p>amount: {fetchedEscrow.amount}</p>
        <p>details: {fetchedEscrow.details}</p>
        <p>isDead: {fetchedEscrow.isDead}</p>
      {/if}

      {#if detailsErrorMsg}
        <Alert title="Error!" color="red">{detailsErrorMsg}</Alert>
      {/if}
    {:else}
      <CreateEscrowComp />
    {/if}
  </Container>
</SvelteUIProvider>
