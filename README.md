# Trading UI

This dApp is a (very) lightweight UI written with Svelte and is designed to compile to a single html file so it can be decentralized when hosted on [IPFS](https://ipfs.tech/).

The Smart Contract (SC) that this dApp connects to is the [Staked Escrow](https://github.com/KipCrossing/staked_escrow) SC. The SC has be deployed on the Sepolia testnet with address: [0x3e013f301A2E09546ab3f1a5354bC53C51A6341E](https://sepolia.etherscan.io/address/0x3e013f301A2E09546ab3f1a5354bC53C51A6341E)

## Get started

Install the dependencies:

```bash
npm install --force
```

Need to fix deps problem

Run:

```bash
npm run dev
```

Build and start (compiled file):

```bash
npm run build
npm run start
```

You will need to install the [Metamask](https://metamask.io/) extension on your browser to interact with the Smart Contract.

Currently the StakedEscrow SC is deployed on the Sepolia testnet. You will need to get some test eth from a _Sepolia faucet_.

### Update ABI

**!!! FIRST: update the contract address !!!**

To update the abi, you will need to add the path of the `StakedEscrow__factory.ts` file to your `.env` file

```
ABI_PATH=path/to/staked_escrow/typechain-types/factories/StakedEscrow__factory.ts
```

The to update, run:

```
npm run update_abi
```

### Deploy

To deploy to ipfs:

```
npm run deploy
```

This will return the cid

## Developing

### EVM

To interact with the smart contract on the EVM, [viem](https://viem.sh/docs) is used.

### Styles

To style this site, we are currently using [svelteui.org](https://www.svelteui.org/)

### TODO

#### Build

- npm cli to get latest, contract address, abi and types from StakesEscrow repo `npm run update_abi`

#### App

- save escrows that buyer has entered into
- also save the block number and use it to search for complete or cancel
- Share button (copy link)
- Instruction???
