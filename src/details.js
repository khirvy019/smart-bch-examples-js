import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { getWallet, getWallets } from "./main.js";

const argv = await yargs(hideBin(process.argv))
  .option('wallet', {
    alias: 'w',
    desc: 'Index of wallet to use in coinfg/wallet-conf.js',
    number: true,
    default: -1,
  }) 
  .parse()

const walletIndex = argv.wallet

if (walletIndex < 0) {
  const wallets = getWallets()
  wallets.forEach((wallet, walletIndex) => {
    console.log("Wallet", walletIndex)
    console.log("Public address:", wallet.address)
    console.log("Mnemonic:")
    console.log("\tPhrase:", wallet.mnemonic.phrase)
    console.log("\tPath:", wallet.mnemonic.path)
    console.log("---------------------------------")
  })
  process.exit()
}

const wallet = getWallet(walletIndex)
console.log("Wallet", walletIndex)
console.log("Public address:", wallet.address)
console.log("Mnemonic:")
console.log("\tPhrase:", wallet.mnemonic.phrase)
console.log("\tPath:", wallet.mnemonic.path)
