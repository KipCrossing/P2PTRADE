<script lang="ts">
  import {
    Container,
    Button,
    Alert,
    Center,
    Badge,
    Card,
    Flex,
    Divider,
  } from "@svelteuidev/core";

  import { NO_ONE, contractAddress } from "../utils/consts";
  import { onMount } from "svelte";
  import { Timeline, Text } from "@svelteuidev/core";

  import type { Escrow } from "../types/escrow";
  import {
    formatEther,
    parseEther,
    type Log,
    type TransactionReceipt,
    createPublicClient,
    custom,
    type EIP1193Provider,
    createWalletClient,
    getContract,
  } from "viem";
  import { mainnet, sepolia } from "viem/chains";
  import { abi } from "../types/abi";

  export let ethereum: EIP1193Provider;
  export let account: `0x${string}`;
  export let escrowID: string;

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: custom(ethereum),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: custom(ethereum),
  });

  const contract = getContract({
    address: contractAddress,
    abi: abi,
    publicClient,
    walletClient,
  });

  onMount(() => {
    if (parseInt(escrowID) === 0 || escrowID) {
      getContractDetails();
    }
  });

  let detailsErrorMsg: null | string = null;
  let fetchedEscrow: null | Escrow = null;
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
    if (!escrowNum && escrowNum !== 0) {
      console.log("Please enter escrow number");
      detailsErrorMsg = "Please enter escrow number";
      return;
    }

    const res = await contract.read.escrows([BigInt(escrowNum)]);

    const escrow: Escrow = {
      buyer: res[0],
      merchant: res[1],
      amount: res[2],
      details: res[3],
      isDead: res[4],
      complete: res[5],
    };

    if (escrow.merchant === NO_ONE) {
      console.log("Escrow does not exist");
      detailsErrorMsg = "Escrow does not exist";
      return;
    }
    fetchedEscrow = escrow;
    escrowEth = Number(formatEther(escrow.amount));
    const thisAccount: string = await walletClient.account.address;
    if (thisAccount.toLowerCase() === escrow.merchant.toLowerCase()) {
      isMerchant = true;
    }
    if (thisAccount.toLowerCase() === escrow.buyer.toLowerCase()) {
      isBuyer = true;
    }
    if (escrow.buyer !== NO_ONE) {
      hasBuyer = true;
    }
    if (hasBuyer) {
      progress = 1;
      buyItemData = {
        title: "Buyer Entered",
        description: `The buyer ${escrow.buyer} has entered the escrow and paid ${escrowEth} ETH`,
        extra: `Buyer has also deposited ${escrowEth / 4}`,
        color: "blue",
      };
    } else if (escrow.isDead) {
      progress = 1;
      buyItemData = {
        title: "Escrow Cancelled",
        description: "The escrow was cancelled by the merchant",
        extra: "No staked was deposited by a buyer",
        color: "red",
      };
    }
    if (hasBuyer && escrow.complete) {
      progress = 2;
      completeItemData = {
        title: "Completed",
        description: "The escrow has been completed",
        extra: "The buyer has released the funds to the merchant",
        color: "green",
      };
    } else if (hasBuyer && escrow.isDead) {
      progress = 2;
      completeItemData = {
        title: "Escrow Cancelled",
        description: "The escrow was cancelled by the merchant",
        extra: "The buyer was refunded the full amount",
        color: "red",
      };
    }
  }

  let cancelProgressMsg: null | string = null;

  async function cancelEscrow() {
    cancelProgressMsg = "Canceling escrow...";
    const [account] = await ethereum.request({
      method: "eth_requestAccounts",
    });

    const hash = await contract.write.cancelEscrow([BigInt(escrowID)], {});

    cancelProgressMsg =
      "Cancel request signed and sent. Waiting for confirmation... \n Tx Hash: " +
      hash;

    const transaction: TransactionReceipt =
      await publicClient.waitForTransactionReceipt({
        hash: hash,
      });
    cancelProgressMsg = `Escrow cancelled in block ${transaction.blockNumber}`;

    window.location.reload();
  }

  let enterProgressMsg: string | null = null;

  async function enterEscrow() {
    if (!escrowEth) {
      console.log("Please enter escrow amount");
      enterProgressMsg = "Please enter escrow amount";
      return;
    }

    const amount = escrowEth / 4;
    const amountInWei = Number(parseEther(amount.toString()));
    enterProgressMsg =
      "Depositing... " + escrowEth + " ETH + stake" + amount + "ETH";

    const [account] = await ethereum.request({
      method: "eth_requestAccounts",
    });

    const hash = await contract.write.deposit([BigInt(escrowID)], {
      value: BigInt(amountInWei * 5),
    });

    enterProgressMsg =
      "Deposit request signed and sent. Waiting for confirmation...";

    const transaction: TransactionReceipt =
      await publicClient.waitForTransactionReceipt({
        hash: hash,
      });
    cancelProgressMsg = `Escrow entered in block ${transaction.blockNumber}`;

    enterProgressMsg = null;
    // refresh the page
    window.location.reload();
  }

  let completeProgressMsg: string | null = null;

  async function completeEscrow() {
    if (!escrowEth) {
      completeProgressMsg = "Could not find escrow amount";
      return;
    }

    const amount = escrowEth / 4;
    completeProgressMsg =
      "Completing Trade, sending " + amount + " ETH to the merchant";

    const [account] = await ethereum.request({
      method: "eth_requestAccounts",
    });

    const hash = await contract.write.completeTrade([BigInt(escrowID)], {});

    completeProgressMsg =
      "Complete Escrow request signed and sent. Waiting for confirmation...";

    const transaction: TransactionReceipt =
      await publicClient.waitForTransactionReceipt({
        hash: hash,
      });

    completeProgressMsg = `Escrow cancelled in block ${transaction.blockNumber}`;

    window.location.reload();
  }
</script>

<Container size="xs" override={{ px: "xs" }}>
  <h2>{isMerchant ? "Merchant" : "Buyer"} Portal</h2>
  {#if fetchedEscrow}
    <Card shadow="sm" padding="lg">
      <Flex justify="space-between">
        <p style="margin-top: 0">Escrow #<strong>{escrowID}</strong></p>
        <div>
          <p style="margin-top: 0">
            status
            {#if fetchedEscrow.complete}
              <Badge variant="filled" color={"green"}>{"complete"}</Badge>
            {:else if fetchedEscrow.isDead}
              <Badge variant="filled" color={"red"}>{"cancelled"}</Badge>
            {:else}
              <Badge variant="filled" color={"blue"}>{"active"}</Badge>
            {/if}
            <br />
          </p>
        </div>
      </Flex>
      <h3>{fetchedEscrow.details}</h3>
      <p>
        merchant:
        <Badge size="md" variant="outline" color={"blue"}
          >{fetchedEscrow.merchant}</Badge
        >
      </p>
      <p>
        buyer: <Badge variant="outline" color={hasBuyer ? "purple" : "orange"}
          >{hasBuyer ? fetchedEscrow.buyer : "waiting for buyer"}</Badge
        >
      </p>
      <p>amount: <strong>{escrowEth}</strong></p>
      <Divider variant="dotted" />
      <small><strong>Description of goods / services</strong></small>
      <p>Longer description of services can go here.</p>
    </Card>

    {#if isMerchant && !fetchedEscrow.isDead}
      <br />

      {#if cancelProgressMsg !== null}
        <Button loading color="red">Cancel Escrow</Button>
        <Alert title="Status" color="blue">{cancelProgressMsg}</Alert>
      {:else}
        <Button variant="subtle" color="red" on:click={cancelEscrow}
          >Cancel Escrow</Button
        >
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
            Merchant created<Text variant="link" root="span" href="#" inherit
              >Escrow {escrowID}</Text
            > for {fetchedEscrow.details}</Text
          >
          {#if escrowEth}
            <Text size="xs">Merchant Deposited {escrowEth / 4}</Text>
          {/if}
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
