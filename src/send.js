import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { utils } from 'ethers'
import { getWallet } from './main.js'
import { query } from './utils.js'

const argv = await yargs(hideBin(process.argv))
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

const walletIndex = argv.wallet
let recipient = argv.recipient
let amountStr = argv.amount
const skipConfirm = argv['skip-confirm']

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

console.log("Sending", utils.formatEther(amount), "BCH to", `'${recipient}'`)
console.log(`Using wallet ${walletIndex+1}: '${wallet.address}'`)

if (!skipConfirm) {
  const resp = await query("Confirm. y/n: ")
  if (resp.trim().toLowerCase() === 'n') {
    console.log('Exiting')
    process.exit()
  }
}

try {
  const tx = await wallet.sendTransaction({
    to: recipient,
    value: amount,
  })
  console.log("Tx:", tx)
} catch (e) {
  console.log("Error sending transaction")
  // console.log("\tMessage:", e.message)
  console.log("\tReason:", e.reason)
  console.log("\tCode:", e.code)
  // console.log("\tError:", e.error)
  // console.log("\tTx:", e.tx)
  process.exit()
}
