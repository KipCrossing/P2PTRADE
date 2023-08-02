# Trading UI

This dApp is a (very) lightweight UI written with Svelte and is designed to compile to a single html file so it can be decentralized when hosted on [IPFS](https://ipfs.tech/).

The Smart Contract (SC) that this dApp connects to is the [Staked Escrow](https://github.com/KipCrossing/staked_escrow) SC. The SC has be deployed on the Sepolia testnet with address: [0x3e013f301A2E09546ab3f1a5354bC53C51A6341E](https://sepolia.etherscan.io/address/0x3e013f301A2E09546ab3f1a5354bC53C51A6341E)

## Get started

Install the dependencies:

```bash
npm install
```

Run:

```bash
npm run dev
```

Build:

```bash
npm run build
```

You will need to install the [Metamask](https://metamask.io/) extension on your browser to interact with the Smart Contract.

Currently the StakedEscrow SC is deployed on the Sepolia testnet. You will need to get some test eth from a _Sepolia faucet_.

## Developing

### EVM

To interact with the smart contract on the EVM, [viem](https://viem.sh/docs) is used.

### Styles

To style this site, we are currently using [svelteui.org](https://www.svelteui.org/)

### TODO

#### Build

- look deeper into [viem](https://viem.sh/docs/contract/getContract.html)
- npm cli to get latest, contract address, abi and types from StakesEscrow repo `npm run update_abi`
- Need to add a step in the build process to copy the js into the html script tag instead of manually doing it.
- Add Web3 (IPFS) dev dep to automatically upload to IPFS on `npm run deploy`

#### App

- save escrows that buyer has entered into
- also save the block number and use it to search for complete or cancel
- Share button (copy link)
- Instruction???
