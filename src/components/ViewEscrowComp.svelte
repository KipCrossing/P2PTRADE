<script lang="ts">
  import { Container, Button, Alert } from "@svelteuidev/core";
  import { ethers } from "ethers";
  import { NO_ONE, contractAddress } from "../utils/consts";
  import { contractObject } from "../contract";
  import type { StakedEscrow } from "../types/StakedEscrow";
  import { onMount } from "svelte";

  export let escrowID: string;

  const provider = new ethers.BrowserProvider(window.ethereum);

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
</script>

<Container size="xs" override={{ px: "xs" }}>
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
</Container>
