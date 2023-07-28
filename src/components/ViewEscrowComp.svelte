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
    if (hasBuyer && res.isDead) {
      progress = 2;
    } else if (res.isDead) {
      progress = 1;
      buyItemData = {
        title: "Escrow Cancelled",
        description: "The escrow was cancelled by the merchant",
        extra: "No staked was deposited by a buyer",
        color: "red",
      };
    }
  }

  let cancelProgressMsg: null | string = null;

  async function cancelEscrow() {
    cancelProgressMsg = "Canceling escrow...";
    const amount = parseInt(fetchedEscrow.amount.toString());
    const signer = await provider.getSigner();
    // console.log(signer.address)
    // signer.sendTransaction({to: signer.address, value: amount})

    const stakedEscrowContract = new ethers.Contract(
      contractAddress,
      contractObject.abi,
      signer
    ) as any as StakedEscrow;
    const tx = await stakedEscrowContract.cancelEscrow(parseInt(escrowID));
    cancelProgressMsg =
      "Cancel request signed and sent. Waiting for confirmation...";

    const receipt = await tx.wait();
    console.log("receipt", receipt);

    cancelProgressMsg = `Escrow cancelled in block ${receipt.blockNumber}`;

    const EscrowCreatedEvent =
      stakedEscrowContract.filters["EscrowCreated(uint256,address,uint256)"];
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
</script>

<Container size="xs" override={{ px: "xs" }}>
  <h2>Buyer Portal</h2>
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

        <Timeline.Item title="Complete">
          <Text color="dimmed" size="sm"
            ><Text variant="link" root="span" href="#" inherit
              >Robert Gluesticker</Text
            > left a code review on your pull request</Text
          >
          <!-- <Text size="xs">12 minutes ago</Text> -->
        </Timeline.Item>
      </Timeline>
    </Center>
  {/if}

  {#if detailsErrorMsg}
    <Alert title="Error!" color="red">{detailsErrorMsg}</Alert>
  {/if}
</Container>
