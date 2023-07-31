export type Escrow = {
  buyer: string;
  merchant: string;
  amount: bigint;
  details: string;
  isDead: boolean;
  complete: boolean;
};
