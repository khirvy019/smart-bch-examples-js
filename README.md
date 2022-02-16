# smart-bch-examples-js
Implementation of common functions to use for a Smart BCH wallet using [ethers](https://docs.ethers.io/v4/getting-started.html) library. 

## Commands
Must be executed in `src` folder

```
Usage:
node <command>

Commands:
    details         - show details of wallets, (mnemonic, path, and address)
    balance         - show balance of a wallet
    send            - send bch to another wallet
    send-token      - send a sep20 token to another wallet
    txs             - show txs, does not include sep20 tokens at the moment

Check node <command> --help for more info
```

## Config
- `test`: boolean to switch between mainnet and testnet
- `rpcUrls`: urls used for setting up provider. Must be an object each with `test` and `main` rpc url
- `wallets`: storage for setting list of wallets to use. Must be an object with `mnemonic` and `path`.
- `tokens`: List of SEP20 token addresses to use when using mainnet
- `testTokens`: List of SEP20 token addresses to use when using testnet

Configs are in `src/config/wallet-conf.js`, example:
```
export default {
  // providers
  test: true,
  rpcUrls: {
    test: 'http://35.220.203.194:8545/',
    main: 'https://smartbch.fountainhead.cash/mainnet',
  },

  // wallet credentials
  wallets: [
    {
      mnemonic: "electric legal eight crack series tomorrow donkey renew permit know bonus toss",
      path: "m/44'/60'/0'/0/0",
    },
    {
      mnemonic: "fortune ketchup cancel trigger client modify crack winner comfort hotel crop fatal",
      path: "m/44'/60'/0'/0/0",
    },
  ],

  // token addresses
  tokens: [
    "0xe11829a7d5d8806bb36e118461a1012588fafd89", // spice
    "0x265bD28d79400D55a1665707Fa14A72978FA6043", // cats
    // ...
  ],
  testTokens: [
    "0x9E06bF2B60f42e5bA8E0c9BDfB2242924d09fD78", // amm
    // ...
  ]
}
```

## Helpful links:
Smart contract tutorial - https://cryptozombies.io/en/course

Ethereum js library - https://docs.ethers.io/v4/getting-started.html

SEP20 Tokens - https://zh.thedev.id/sep20tokens/index.html

JSON RPC Functions for Smart BCH - https://docs.smartbch.org/smartbch/developers-guide/jsonrpc#sbch
