# smart-bch-examples-js
Implementation of common functions to use for a Smart BCH wallet using [ethers](https://docs.ethers.io/v4/getting-started.html) library. 

## Commands
Must be executed in `src` folder

```
Usage:
main <command>

Commands:
  balance      Show balance of wallet
  list-erc721  List tokens of an ERC721 contract
  listen       Listen to new transactions of address
  send-sep20   Send SEP20 token to another address
  send         Send BCH to another address
  txs          List transactions of wallet
  wallets      List details of wallet

Check node main <command> --help for more info
```

## Config
- `network.test`: boolean to switch between mainnet and testnet
- `network.rpcUrls`: urls used for setting up provider. Must be an object each with `test` and `main` rpc url
- `wallets`: storage for setting list of wallets to use. Must be an object with `mnemonic` and `path`.
- `tokens`: List of SEP20 token addresses to use when using mainnet
- `testTokens`: List of SEP20 token addresses to use when using testnet



Configs are in `src/config/index.js`

## Helpful links:
Smart contract tutorial - https://cryptozombies.io/en/course

Ethereum js library - https://docs.ethers.io/v4/getting-started.html

SEP20 Tokens - https://zh.thedev.id/sep20tokens/index.html

JSON RPC Functions for Smart BCH - https://docs.smartbch.org/smartbch/developers-guide/jsonrpc#sbch
