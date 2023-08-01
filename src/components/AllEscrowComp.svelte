<script lang="ts">
  import { Badge, Card, Button } from "@svelteuidev/core";
  import { Container } from "@svelteuidev/core";
  import type { EscrowInfo } from "../types/escrowInfo";
  import { escrowList, getEscrowList } from "../utils/storage";
  import { onMount } from "svelte";
  import { getAccount } from "../utils/getAccount";
  import { contractAddress } from "../utils/consts";
  import { StakedEscrow__factory, type StakedEscrow } from "../types";
  import { writable, type Writable } from "svelte/store";
  import { useContract } from "../utils/client";
  import type { Escrow } from "../types/escrow";

  const abi = StakedEscrow__factory.abi;

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

<Container size="xs" override={{ px: "xs" }}>
  {#each $allEscrowList as { escrowId, amount, details }, i}
    <li>
      <Card shadow="sm" padding="lg">
        <h3>Escrow {escrowId}</h3>

        <Badge variant="filled">{Number(amount) / 10 ** 18}</Badge>
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
