# Trading UI

This dApp is a (very) lightweight UI written with Svelte and id designed to compile to a single html file so it can be decentralized when hosted on [IPFS](https://ipfs.tech/).

The Smart Contract (SC) that this dApp connects to is the [Staked Escrow](https://github.com/KipCrossing/staked_escrow) SC. The SC has be deployed on the Sepolia testnet with address: [0x8276EF08D33D4D805f1d19F00851023660c0ae13](https://sepolia.etherscan.io/address/0x8276EF08D33D4D805f1d19F00851023660c0ae13)

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

### Styles

To style this site, we are currently using [svelteui.org](https://www.svelteui.org/)

### TODO

#### Build

- Need to add a step in the build process to copy the js into the html script tag instead of manually doing it.
- Add Web3 (IPFS) dev dep to automatically upload to IPFS on `npm run deploy`

#### App

- save created escrows to the client and display them in a list
