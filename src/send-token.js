import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { utils } from 'ethers'
import { getWallet, getTokenContract } from './main.js'
import { query } from './utils.js'


const argv = await yargs(hideBin(process.argv))
  .option('token', {
    alias: 't',
    desc: 'Address of the SEP20 token',
    string: true,
    default: '',
  })
  .option('wallet', {
    alias: 'w',
    desc: 'Index of wallet to use in coinfg/wallet-conf.js',
    number: true,
    default: 0,
  })
  .option('recipient', {
    alias: 'r',
    desc: 'Recipient address of wallet',
    string: true,
    default: '',
  })
  .option('amount', {
    alias: 'a',
    desc: 'Amount to send',
    string: true,
    default: '',
  })
  .option('skip-confirm', {
    desc: 'To skip confirm',
    boolean: true,
    default: false,
  })
  .parse()

let tokenAddress = argv.token
const walletIndex = argv.wallet
let recipient = argv.recipient
let amountStr = argv.amount
const skipConfirm = argv['skip-confirm']

while(!utils.isAddress(tokenAddress)) {
  const prompt = recipient ? "Invalid token address, please input an address:" : "Please input a token address:"
  tokenAddress = await query(prompt)
  tokenAddress = tokenAddress.trim()
}

while(!utils.isAddress(recipient)) {
  const prompt = recipient ? "Invalid recipient address, please input an address:" : "Please input a recipient address:"
  recipient = await query(prompt)
  recipient = recipient.trim()
}

while (Number.isNaN(Number(amountStr)) || Number(amountStr) <= 0) {
  const prompt = "Invalid amount, please input amount to send:"
  amountStr = await query(prompt)
  amountStr = amountStr.trim()
}

const amount = utils.parseEther(amountStr)
const wallet = getWallet(walletIndex)

const tokenContract = getTokenContract(tokenAddress)
const contractWithSigner = tokenContract.connect(wallet)
const tokenName = await contractWithSigner.name()
const symbol = await contractWithSigner.symbol()

console.log("Sending", tokenName)
console.log("Amount:", utils.formatEther(amount), symbol)
console.log("Recipient:", recipient)
console.log(`Using wallet ${walletIndex+1}: '${wallet.address}'`)

if (!skipConfirm) {
  const resp = await query("Confirm. y/n: ")
  if (resp.trim().toLowerCase() === 'n') {
    console.log('Exiting')
    process.exit()
  }
}

try {
  const success = await contractWithSigner.transfer(recipient, amount)
  if (success) {
    console.log("Transaction success!", success)
  } else {
    console.log("Transaction unsuccessful", success)
  }
} catch (e) {
  console.log("Error sending transaction")
  // console.log("\tMessage:", e.message)
  console.log("\tReason:", e.reason)
  console.log("\tCode:", e.code)
  // console.log("\tError:", e.error)
  // console.log("\tTx:", e.tx)
  process.exit()
}

