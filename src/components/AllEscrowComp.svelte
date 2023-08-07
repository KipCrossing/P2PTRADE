<script lang="ts">
  import { Badge, Card, Button } from "@svelteuidev/core";
  import { Container } from "@svelteuidev/core";
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import type { Escrow } from "../types/escrow";
  import type { EIP1193Provider } from "viem";

  import {
    createPublicClient,
    createWalletClient,
    custom,
    getContract,
  } from "viem";
  import { sepolia } from "viem/chains";
  import { abi } from "../types/abi";
  import { contractAddress } from "../utils/consts";

  export let ethereum: EIP1193Provider;
  export let account: `0x${string}`;

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

  let allEscrowList: Writable<(Escrow & { escrowId: number })[]> = writable([]);

  async function getEscrowInfo(escrowID: bigint) {
    const [account] = await ethereum.request({
      method: "eth_requestAccounts",
    });

    const res = await contract.read.escrows([BigInt(escrowID)]);

    const escrow: Escrow = {
      buyer: res[0],
      merchant: res[1],
      amount: res[2],
      details: res[3],
      isDead: res[4],
      complete: res[5],
    };
    return escrow;
  }

  onMount(() => {
    let allEscrowListTemp: (Escrow & { escrowId: number })[] = [];
    getMerchantEscrows().then((escrowIDs: readonly bigint[]) => {
      const escrowIDsList: bigint[] = [];
      escrowIDs.forEach((escrowID) => {
        escrowIDsList.push(escrowID);
      });
      escrowIDsList.reverse().forEach((escrowID) => {
        console.log(escrowID);
        getEscrowInfo(escrowID).then((escrow) => {
          allEscrowListTemp.push({ ...escrow, escrowId: Number(escrowID) });
          allEscrowList.set(allEscrowListTemp);
        });
      });
    });
  });

  async function getMerchantEscrows() {
    const escrowIDs = await contract.read.getMerchantEscrows([account]);

    return escrowIDs;
  }
</script>

<Container size="xs" style="padding: 0px">
  {#each $allEscrowList as { escrowId, amount, details }, i}
    <Card shadow="sm" padding="lg">
      <h3 style="margin-bottom: 0;">{details}</h3>
      <p style="margin-bottom: 0;">Escrow #<strong>{escrowId}</strong></p>
      <br />
      <Badge variant="filled">{Number(amount) / 10 ** 18}</Badge>
      <p>Details of the transaction can go here.</p>
      <Button
        variant="light"
        fullSize
        href={`${window.location.href}?escrowID=${escrowId}`}>View</Button
      >
    </Card>
    <br />
  {/each}
</Container>
