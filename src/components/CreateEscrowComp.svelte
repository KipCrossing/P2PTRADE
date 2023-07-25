<script lang="ts">
  import { onMount } from "svelte";
  import { Container, Button, Alert } from "@svelteuidev/core";
  import { ethers } from "ethers";
  import { contractAddress } from "../utils/consts";
  import { contractObject } from "../contract";
  import type { StakedEscrow } from "../types/StakedEscrow";

  const provider = new ethers.BrowserProvider(window.ethereum);

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

  onMount(() => {});
</script>

<Container size="xs" override={{ px: "xs" }}>
  {#if newEscrowNumber}
    <h3>Escrow created!</h3>
    <Button
      href={`${window.location.href}?escrowID=${newEscrowNumber}`}
      target="_blank">View Escrow {newEscrowNumber}</Button
    >
  {:else}
    <input bind:value={details} placeholder="Escrow details" />
    <input
      type="Amount"
      bind:value={escrowAmount}
      placeholder="Escrow amount"
    />

    {#if createProgressMsg !== null}
      <Button loading>Create Escrow</Button>
      <Alert title="Status" color="blue">{createProgressMsg}</Alert>
    {:else}
      <Button on:click={createEscrow}>Create Escrow</Button>
    {/if}
  {/if}

  {#if createErrorMsg}
    <Alert title="Error!" color="red">{createErrorMsg}</Alert>
  {/if}
</Container>
