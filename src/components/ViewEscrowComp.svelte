<script lang="ts">
  import {
    Container,
    Button,
    Alert,
    Center,
    Badge,
    Card,
  } from "@svelteuidev/core";
  import { ethers } from "ethers";
  import { NO_ONE, contractAddress } from "../utils/consts";
  import { contractObject } from "../contract";
  import type { StakedEscrow } from "../types/StakedEscrow";
  import { onMount } from "svelte";
  import { Timeline, Text } from "@svelteuidev/core";
  import { getAccount } from "../utils/getAccount";

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
  let escrowEth: null | number = null;
  let isMerchant = false;
  let hasBuyer = false;
  let isBuyer = false;
  let progress = 0;

  type TimelineItemData = {
    title: string;
    description: string;
    extra: string;
    color: string;
  };

  let buyItemData: TimelineItemData = {
    title: "Buyer Entered",
    description: "",
    extra: "",
    color: "dimmed",
  };

  let completeItemData: TimelineItemData = {
    title: "Complete",
    description: "",
    extra: "",
    color: "dimmed",
  };

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
    escrowEth = Number(ethers.formatEther(res.amount));
    const thisAccount: string = await getAccount();
    if (thisAccount.toLowerCase() === res.merchant.toLowerCase()) {
      isMerchant = true;
    }
    if (thisAccount.toLowerCase() === res.buyer.toLowerCase()) {
      isBuyer = true;
    }
    if (res.buyer !== NO_ONE) {
      hasBuyer = true;
    }
    if (hasBuyer) {
      progress = 1;
      buyItemData = {
        title: "Buyer Entered",
        description: `The buyer ${res.buyer} has entered the escrow and paid ${escrowEth} ETH`,
        extra: `Buyer has also deposited ${escrowEth / 4}`,
        color: "blue",
      };
    } else if (res.isDead) {
      progress = 1;
      buyItemData = {
        title: "Escrow Cancelled",
        description: "The escrow was cancelled by the merchant",
        extra: "No staked was deposited by a buyer",
        color: "red",
      };
    }

    if (hasBuyer && res.isDead) {
      progress = 2;
      completeItemData = {
        title: "Ended",
        description: "The escrow has ended",
        extra: "The buyer received the goods or the merchant refunded",
        color: "black",
      };
    }
  }

  let cancelProgressMsg: null | string = null;

  async function cancelEscrow() {
    cancelProgressMsg = "Canceling escrow...";
    const signer = await provider.getSigner();

    const stakedEscrowContract = new ethers.Contract(
      contractAddress,
      contractObject.abi,
      signer
    ) as any as StakedEscrow;
    const tx = await stakedEscrowContract.cancelEscrow(Number(escrowID));
    cancelProgressMsg =
      "Cancel request signed and sent. Waiting for confirmation...";

    const receipt = await tx.wait();
    console.log("receipt", receipt);

    cancelProgressMsg = `Escrow cancelled in block ${receipt.blockNumber}`;

    const EscrowCreatedEvent =
      stakedEscrowContract.filters["EscrowCancelled(uint256)"];
    const events = await stakedEscrowContract.queryFilter(
      EscrowCreatedEvent,
      receipt.blockNumber
    );
    console.log("events", events);
    // TODO: add some checks to make sure the event is the one we want

    cancelProgressMsg = null;
    // refresh the page
    window.location.reload();
  }

  let enterProgressMsg: string | null = null;

  async function enterEscrow() {
    const amount = escrowEth / 4;
    enterProgressMsg = "Depositing... " + amount + " ETH";
    const signer = await provider.getSigner();

    const stakedEscrowContract = new ethers.Contract(
      contractAddress,
      contractObject.abi,
      signer
    ) as any as StakedEscrow;
    const tx = await stakedEscrowContract.deposit(Number(escrowID), {
      value: ethers.parseEther((escrowEth * 1.25).toString()),
    });
    enterProgressMsg =
      "Deposit request signed and sent. Waiting for confirmation...";

    const receipt = await tx.wait();
    console.log("receipt", receipt);

    enterProgressMsg = `Escrow cancelled in block ${receipt.blockNumber}`;

    const EscrowCreatedEvent =
      stakedEscrowContract.filters["Deposit(uint256,address,uint256)"];
    const events = await stakedEscrowContract.queryFilter(
      EscrowCreatedEvent,
      receipt.blockNumber
    );
    console.log("events", events);
    // TODO: add some checks to make sure the event is the one we want

    enterProgressMsg = null;
    // refresh the page
    window.location.reload();
  }

  let completeProgressMsg: string | null = null;

  async function completeEscrow() {
    const amount = escrowEth / 4;
    completeProgressMsg =
      "Completing Trade, sending " + amount + " ETH to the merchant";
    const signer = await provider.getSigner();

    const stakedEscrowContract = new ethers.Contract(
      contractAddress,
      contractObject.abi,
      signer
    ) as any as StakedEscrow;
    const tx = await stakedEscrowContract.completeTrade(Number(escrowID));
    completeProgressMsg =
      "Complete Escrow request signed and sent. Waiting for confirmation...";

    const receipt = await tx.wait();
    console.log("receipt", receipt);

    completeProgressMsg = `Escrow cancelled in block ${receipt.blockNumber}`;

    const EscrowCreatedEvent =
      stakedEscrowContract.filters["TradeCompleted(uint256,address)"];
    const events = await stakedEscrowContract.queryFilter(
      EscrowCreatedEvent,
      receipt.blockNumber
    );
    console.log("events", events);
    // TODO: add some checks to make sure the event is the one we want

    completeProgressMsg = null;
    // refresh the page
    window.location.reload();
  }
</script>

<Container size="xs" override={{ px: "xs" }}>
  <h2>{isMerchant ? "Merchant" : "Buyer"} Portal</h2>
  {#if fetchedEscrow}
    <Card shadow="sm" padding="lg">
      <p>
        Status: <Badge
          variant="filled"
          color={fetchedEscrow.isDead ? "red" : "green"}
          >{fetchedEscrow.isDead ? "dead" : "active"}</Badge
        >
      </p>
      <p>
        merchant: <Badge variant="filled" color={"blue"}
          >{fetchedEscrow.merchant}</Badge
        >
      </p>
      <p>
        buyer: <Badge variant="filled" color={hasBuyer ? "purple" : "red"}
          >{hasBuyer ? fetchedEscrow.buyer : "waiting for buyer"}</Badge
        >
      </p>
      <p>amount: <strong>{escrowEth}</strong></p>
      <p>details: {fetchedEscrow.details}</p>
    </Card>

    {#if isMerchant && !fetchedEscrow.isDead}
      <br />

      {#if cancelProgressMsg !== null}
        <Button loading color="red">Cancel Escrow</Button>
        <Alert title="Status" color="blue">{cancelProgressMsg}</Alert>
      {:else}
        <Button color="red" on:click={cancelEscrow}>Cancel Escrow</Button>
      {/if}
    {/if}

    {#if !isMerchant && !isBuyer && !fetchedEscrow.isDead}
      <br />

      {#if enterProgressMsg !== null}
        <Button loading color="green">Enter Escrow</Button>
        <Alert title="Status" color="blue">{enterProgressMsg}</Alert>
      {:else}
        <Button color="green" on:click={enterEscrow}>Enter Escrow</Button>
      {/if}
    {/if}

    {#if !isMerchant && isBuyer && !fetchedEscrow.isDead}
      <br />
      {#if completeProgressMsg !== null}
        <Button loading color="green">Release Payment to Merchant</Button>
        <Alert title="Status" color="blue">{completeProgressMsg}</Alert>
      {:else}
        <Button color="green" on:click={completeEscrow}
          >Release Payment to Merchant</Button
        >
      {/if}
    {/if}

    <br />
    <Center>
      <Timeline active={progress} lineWidth={4} bulletSize={20}>
        <Timeline.Item title="New Escrow">
          <Text color="dimmed" size="sm">
            You&apos;ve created new branch<Text
              variant="link"
              root="span"
              href="#"
              inherit>fix-notifications</Text
            > from master</Text
          >
          <Text size="xs">Merchant Deposited {escrowEth / 4}</Text>
        </Timeline.Item>

        <Timeline.Item title={buyItemData.title} color={buyItemData.color}>
          <Text size="sm" color={buyItemData.color}
            >{buyItemData.description}</Text
          >
          <Text size="xs">{buyItemData.extra}</Text>
        </Timeline.Item>

        <Timeline.Item
          title={completeItemData.title}
          color={completeItemData.color}
        >
          <Text size="sm" color={completeItemData.color}
            >{completeItemData.description}</Text
          >
          <Text size="xs">{completeItemData.extra}</Text>
        </Timeline.Item>
      </Timeline>
    </Center>
  {/if}

  {#if detailsErrorMsg}
    <Alert title="Error!" color="red">{detailsErrorMsg}</Alert>
  {/if}
</Container>
