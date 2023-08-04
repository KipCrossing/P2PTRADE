<script lang="ts">
  import { Container, Button, Alert, Textarea, TextInput } from "@svelteuidev/core";
  import { parseEther, type Log, type TransactionReceipt } from "viem";
  import { ethereum, publicClient, useContract } from "../utils/client";

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

    const amount = parseEther(escrowAmount.toString());

    const [account] = await ethereum.request({
      method: "eth_requestAccounts",
    });

    const contract = useContract(account);

    type EscrowCreatedDetails = {
      _escrowId: bigint;
      _merchant: `0x${string}`;
      _value: bigint;
    };

    let merchantLogs: (Log & { args: EscrowCreatedDetails })[] | null = null;

    contract.watchEvent.EscrowCreated(
      { _merchant: account },
      {
        onLogs: (logs) => {
          merchantLogs = logs;
        },
      }
    );

    const hash = await contract.write.createEscrow([amount, details], {
      value: parseEther((escrowAmount / 4).toString()),
    });
    createProgressMsg = `Escrow request signed and sent. Waiting for confirmation... \n Transaction hash: ${hash}`;

    const transaction: TransactionReceipt =
      await publicClient.waitForTransactionReceipt({
        hash: hash,
      });

    createProgressMsg = `Escrow created in block ${transaction.blockNumber}`;

    if (merchantLogs) {
      merchantLogs.forEach((log) => {
        if (log.blockNumber === transaction.blockNumber) {
          newEscrowNumber = Number(log.args._escrowId);
        }
      });
    }
    createProgressMsg = `Escrow created with ID ${newEscrowNumber}`;
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
  <h3>Create Escrow</h3>
  <TextInput
  bind:value={details}
  placeholder="Escrow Details"
/>
<TextInput
type="Amount"
bind:value={escrowAmount}
placeholder="Escrow amount"
/>
<Textarea
placeholder="Description of Goods / Services"
/>

    <!-- <input bind:value={details} placeholder="Escrow details" />
    <input
      type="Amount"
      bind:value={escrowAmount}
      placeholder="Escrow amount"
    /> -->

    {#if createProgressMsg !== null}
      <Button loading><h2>Create Escrow</h2></Button>
      <Alert title="Status" color="blue">{createProgressMsg}</Alert>
    {:else}
      <Button fullSize on:click={createEscrow}>Create Escrow</Button>
    {/if}
  {/if}

  {#if createErrorMsg}
    <Alert title="Error!" color="red">{createErrorMsg}</Alert>
  {/if}
</Container>
