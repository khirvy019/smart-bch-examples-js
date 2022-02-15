import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { getWallet } from "./main.js";

const argv = await yargs(hideBin(process.argv))
  .option('wallet', {
    alias: 'w',
    desc: 'Index of wallet to use in coinfg/wallet-conf.js',
    number: true,
    default: 0,
  }) 
  .parse()

const walletIndex = argv.wallet

const wallet = getWallet(walletIndex)
console.log("Wallet", walletIndex)
console.log("Public address:", wallet.address)
console.log("Mnemonic:")
console.log("\tPhrase:", wallet.mnemonic.phrase)
console.log("\tPath:", wallet.mnemonic.path)
