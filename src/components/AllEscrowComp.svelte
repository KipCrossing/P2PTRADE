<script lang="ts">
  import { Badge, Card, Button } from "@svelteuidev/core";
  import { Container } from "@svelteuidev/core";
  import type { EscrowInfo } from "../types/escrowInfo";

  const allEscrowList: EscrowInfo[] = [
    {
      escrowId: "1",
      amount: 0.1,
      details: "test",
    },
    {
      escrowId: "2",
      amount: 0.1,
      details: "test2",
    },
    {
      escrowId: "3",
      amount: 0.1,
      details: "test3",
    },
  ];
</script>

<Container size="xs" override={{ px: "xs" }}>
  {#each allEscrowList as { escrowId, amount, details }, i}
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
