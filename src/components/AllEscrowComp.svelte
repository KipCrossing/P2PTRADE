<script lang="ts">
  import { Badge, Card, Button } from "@svelteuidev/core";
  import { Container } from "@svelteuidev/core";
  import type { EscrowInfo } from "../types/escrowInfo";
  import { escrowList, getEscrowList } from "../utils/storage";
  import { onMount } from "svelte";
  import { getAccount } from "../utils/getAccount";

  let allEscrowList: EscrowInfo[] = [];

  onMount(() => {
    getAccount().then((acc) => {
      // console.log(acc);
      allEscrowList = getEscrowList(acc);
      // console.log(allEscrowList);
    });
  });
</script>

<Container size="xs" override={{ px: "xs" }}>
  {#each $escrowList as { escrowId, amount, details }, i}
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
