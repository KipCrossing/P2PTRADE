<script lang="ts">
  import { onMount } from "svelte";
  import { Container, Button, Alert } from "@svelteuidev/core";
  import { ethers } from "ethers";
  import { contractAddress } from "../utils/consts";
  import type { StakedEscrow } from "../types/StakedEscrow";
  import { updateEscrowList } from "../utils/storage";
  import type { EscrowInfo } from "../types/escrowInfo";
  import { StakedEscrow__factory } from "../types/factories/StakedEscrow__factory";
  import { getContract, parseEther, parseTransaction } from "viem";
  import { publicClient, walletClient } from "../utils/client";

  const abi = StakedEscrow__factory.abi;

  const provider = new ethers.BrowserProvider(window.ethereum);

  const contract = getContract({
    address: contractAddress,
    abi: StakedEscrow__factory.abi,
    publicClient,
    walletClient,
  });

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
    // const signer = await provider.getSigner();
    // // console.log(signer.address)
    // // signer.sendTransaction({to: signer.address, value: amount})

    // const stakedEscrowContract = new ethers.Contract(
    //   contractAddress,
    //   abi,
    //   signer
    // ) as any as StakedEscrow;

    const amount = parseEther(escrowAmount.toString());

    const address = await walletClient.requestAddresses();

    //  Argument of type '[bigint]' is not assignable to parameter of type
    //  'readonly [bigint, string]'.
    //  Source has 1 element(s) but target requires 2.ts(2345)
    const hash = await contract.write.createEscrow([amount, address[0]], {
      value: parseEther((escrowAmount / 4).toString()),
    });

    console.log("hash", hash);

    const tx = parseTransaction(hash);
    console.log("tx", tx);

    createProgressMsg =
      "Escrow request signed and sent. Waiting for confirmation...";
    // TODO: add status messages for the transaction

    // const receipt = await tx.wait();
    // console.log("receipt", receipt);

    // createProgressMsg = `Escrow created in block ${receipt.blockNumber}`;

    // const EscrowCreatedEvent =
    //   stakedEscrowContract.filters["EscrowCreated(uint256,address,uint256)"];
    // const events = await stakedEscrowContract.queryFilter(
    //   EscrowCreatedEvent,
    //   receipt.blockNumber
    // );
  }
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
