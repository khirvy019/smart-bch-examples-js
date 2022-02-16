import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { utils } from "ethers"
import { getWallet, getTokenContracts } from "./main.js";

const argv = await yargs(hideBin(process.argv))
  .usage([
    '$0 [-w|--wallet=0]\n',
    'Shows balance of a wallet and other tokens listed in config/wallet-conf.js',
  ].join('\n'))
  .option('wallet', {
    alias: 'w',
    desc: 'Index of wallet to use in config/wallet-conf.js',
    number: true,
    default: 0,
  }) 
  .parse()

const walletIndex = argv.wallet

const wallet = getWallet(walletIndex)
console.log("Getting balance of wallet", `${walletIndex}:`, `:${wallet.address}`, "...")
const balance = await wallet.getBalance()
console.log(balance)
console.log("Balance:", utils.formatEther(balance), "BCH")


const tokenContracts = getTokenContracts()
if (tokenContracts.length) {
  console.log("Getting token addresses ...")
  tokenContracts.forEach(async (contract) => {
    const tokenName = await contract.name()
    const symbol = await contract.symbol()
    const balance = await contract.balanceOf(wallet.address)

    console.log("\t", tokenName, `(${symbol}):`, balance)
  })
}
