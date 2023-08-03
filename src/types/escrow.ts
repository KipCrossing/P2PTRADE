export type Escrow = {
  buyer: `0x${string}`;
  merchant: `0x${string}`;
  amount: bigint;
  details: string;
  isDead: boolean;
  complete: boolean;
};
