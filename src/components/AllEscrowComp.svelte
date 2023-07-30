<script lang="ts">
  import { Badge, Card, Button } from "@svelteuidev/core";
  import { Container } from "@svelteuidev/core";
  import type { EscrowInfo } from "../types/escrowInfo";
  import { escrowList, getEscrowList } from "../utils/storage";
  import { onMount } from "svelte";
  import { getAccount } from "../utils/getAccount";
  import { ethers } from "ethers";
  import { contractAddress } from "../utils/consts";
  import { StakedEscrow__factory, type StakedEscrow } from "../types";
  import { writable, type Writable } from "svelte/store";

  const provider = new ethers.BrowserProvider(window.ethereum);
  const abi = StakedEscrow__factory.abi;

  const stakedEscrowContract = new ethers.Contract(
    contractAddress,
    abi,
    provider
  ) as any as StakedEscrow;

  type Escrow = {
    buyer: string;
    merchant: string;
    amount: bigint;
    details: string;
    isDead: boolean;
    complete: boolean;
  };

  let allEscrowList: Writable<(Escrow & { escrowId: number })[]> = writable([]);

  async function getEscrowInfo(escrowID: bigint) {
    const escrow: Escrow = await stakedEscrowContract.escrows(escrowID);
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
    const signer = provider.getSigner();

    const address = (await signer).address;
    console.log(address);

    console.log("getting...");
    const escrowIDs = await stakedEscrowContract.getMerchantEscrows(address);
    return escrowIDs;
  }
</script>

<Container size="xs" override={{ px: "xs" }}>
  {#each $allEscrowList as { escrowId, amount, details }, i}
    <li>
      <Card shadow="sm" padding="lg">
        <h3>Escrow {escrowId}</h3>

        <Badge variant="filled">{amount}</Badge>
        <p>
          <strong>{details}</strong>
        </p>
        <Button href={`${window.location.href}?escrowID=${escrowId}`}
          >View</Button
        >
      </Card>
      <br />
    </li>
  {/each}
</Container>
