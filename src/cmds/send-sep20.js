import { utils } from 'ethers'
import { sendSep20 } from '../funcs/send-sep20.js'
import { query, getWallet, getSep20Contract } from '../utils.js'

export const command = 'send-sep20'
export const desc = 'Send SEP20 token to another address'
export const builder = {
  'token': {
    alias: 't',
    desc: 'Address of SEP20 contract',
    type: 'string',
  },

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
  let contractAddress = argv.token
  const walletIndex = argv.wallet
  let recipient = argv.recipient
  let amountStr = argv.amount
  const confirmations = argv.confirmations
  const skipConfirm = argv['skip-confirm']

  while(!utils.isAddress(contractAddress)) {
    const prompt = contractAddress ? 'Invalid token address, please input an address:' : 'Please input a token address:'
    contractAddress = await query(prompt)
    contractAddress = contractAddress.trim()
  }  

  while(!utils.isAddress(recipient)) {
    const prompt = recipient ? 'Invalid recipient address, please input an address:' : 'Please input a recipient address:'
    recipient = await query(prompt)
    recipient = recipient.trim()
  }
  
  while (Number.isNaN(Number(amountStr)) || Number(amountStr) <= 0) {
    const prompt = 'Invalid amount, please input amount to send:'
    amountStr = await query(prompt)
    amountStr = amountStr.trim()
  }

  const amount = utils.parseEther(String(amountStr))
  const wallet = getWallet(walletIndex)
  const contract = getSep20Contract(contractAddress)
  const tokenName = await contract.name()
  const tokenSymbol = await contract.symbol()

  console.log('Sending', `${tokenName}:`, utils.formatEther(amount), tokenSymbol, 'to', `'${recipient}'`)
  console.log(`Using wallet ${walletIndex+1}: '${wallet.address}'`)

  if (!skipConfirm) {
    const resp = await query('Confirm. y/n: ')
    if (resp.trim().toLowerCase() === 'n') {
      console.log('Exiting')
      process.exit()
    }
  }

  const response = await sendSep20({
    contractAddress: contractAddress,
    privateKey: wallet.privateKey,
    recipientAddress: recipient,
    amount: utils.formatEther(amount),
  })
  if (response.success) {
    console.log('Send success!')
    console.log('Transaction hash:', response.transaction.hash)
    console.log(
      'Sent', `${response.token.name}:`,
      utils.formatEther(response.transaction.value), response.token.symbol,
      'from', response.transaction.from,
      'to', response.transaction.to
    )

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
