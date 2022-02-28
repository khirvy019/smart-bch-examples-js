import { utils } from 'ethers'
import { sendBCH } from '../funcs/send.js'
import { query, getWallet } from '../utils.js'

export const command = 'send'
export const desc = 'Send BCH to another address'
export const builder = {
  wallet: {
    alias: 'w',
    desc: 'Index of wallet',
    type: 'number',
    default: 0
  },

  recipient: {
    alias: 'r',
    desc: 'Recipient address',
    type: 'string',
  },

  amount: {
    alias: 'a',
    desc: 'Amount to send',
    type: 'number',
    default: 0.0
  },

  'confirmations': {
    alias: 'c',
    type: 'Wait for number of confirmations',
    type: 'number',
    default: -1
  },

  'skip-confirm': {
    desc: 'To skip confirm',
    boolean: true,
    default: false,
  }
}

export async function handler (argv) {
  const walletIndex = argv.wallet
  let recipient = argv.recipient
  let amountStr = argv.amount
  const confirmations = argv.confirmations
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

  const amount = utils.parseEther(String(amountStr))
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

  const response = await sendBCH({
    privateKey: wallet.privateKey,
    recipientAddress: recipient,
    amount: utils.formatEther(amount),
  })
  if (response.success) {
    console.log('Send success!')
    console.log('Transaction hash:', response.transaction.hash)
    console.log('Sent', utils.formatEther(response.transaction.value), 'BCH from', response.transaction.from, 'to', response.transaction.to)

    if (confirmations > 0) {
      console.log('Waiting for', confirmations, 'confirmation/s')
      const waitResp = await response.transaction.wait(confirmations)
      console.log(waitResp)
    }
  } else {
    console.warn('Send failed!')
    console.warn('Error:', response.error)
    if (response._error) console.log('Runtime Error:', response._error)
  }
}
