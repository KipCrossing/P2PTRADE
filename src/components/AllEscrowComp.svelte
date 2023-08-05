<script lang="ts">
  import { Badge, Card, Button } from "@svelteuidev/core";
  import { Container } from "@svelteuidev/core";
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import { useContract } from "../utils/client";
  import type { Escrow } from "../types/escrow";
  import { Plus } from 'radix-icons-svelte';

  let allEscrowList: Writable<(Escrow & { escrowId: number })[]> = writable([]);

  async function getEscrowInfo(escrowID: bigint) {
    const [account] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const contract = useContract(account);
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
    const [account] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const contract = useContract(account);
    const escrowIDs = await contract.read.getMerchantEscrows([account]);

    return escrowIDs;
  }
</script>

<Container size="xs" style="padding: 0px">
  {#each $allEscrowList as { escrowId, amount, details }, i}

      <Card shadow="sm" padding="lg">
        <h3 style="margin-bottom: 0;">{details}</h3>
        <p style="margin-bottom: 0;">Escrow ID# <strong>{escrowId}</strong></p><br>
        <Badge variant="filled">{Number(amount) / 10 ** 18}</Badge>
        <p>Details of the transaction can go here.</p>
        <Button variant="light" fullSize href={`${window.location.href}?escrowID=${escrowId}`}
          >View</Button
        >
      </Card>
    <br />
  {/each}
</Container>
