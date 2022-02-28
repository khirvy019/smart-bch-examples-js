import { utils } from 'ethers'
import { getSep20Transactions, getTransactions, TYPE_INCOMING, TYPE_OUTGOING } from '../funcs/txs.js'
import { getWallet, getSep20Contract } from '../utils.js'

export const command = 'txs'
export const desc = 'List transactions of wallet'
export const builder = {
  wallet: {
    alias: 'w',
    desc: 'Index of wallet',
    type: 'number',
    default: 0
  },

  address: {
    alias: 'address',
    desc: 'Address of wallet',
    type: 'string',
    default: '',
  },

  type: {
    desc: 'Filter incoming transactions only',
    type: 'string',
    default: 'all',
    choices: ['all', 'incoming', 'outgoing'],
  },

  limit: {
    alias: 'l',
    desc: 'Number of transactions to show',
    type: 'number',
    default: 5,
  },

  before: {
    alias: 'b',
    desc: 'Filter transactions before the block number',
    type: 'string',
    default: 'latest',
  },

  after: {
    alias: 'a',
    desc: 'Filter transactions after the block number',
    type: 'number',
    default: 0,
  },

  token: {
    alias: 't',
    desc: 'List transactions for SEP20 contract address. Will show BCH transactions if not specified',
    type: 'string',
    default: '',
  },

  timestamp: {
    alias: 'ts',
    desc: 'Include timestamp of transaction',
    type: 'boolean',
    default: false,
  },
  
  raw: {
    alias: 'r',
    desc: 'Show raw transaction response',
    type: 'boolean',
    default: false,
  }
}

export async function handler(argv) {
  const walletIndex = argv.wallet

  let address = argv.address
  const tokenAddress = argv.token
  const txType = argv.type
  const withTimestamp = argv.timestamp
  const showRaw = argv.raw
  const pagination = {
    before: argv.before,
    after: argv.after,
    limit: argv.limit,
  }

  if (walletIndex >= 0) {
    const wallet = getWallet(walletIndex)
    address = wallet.address
  }

  while(!utils.isAddress(address)) {
    const prompt = recipient ? "Invalid address, please input a valid address:" : "Please input an address:"
    address = await query(prompt)
    address = address.trim()
  }

  let tokenContract = null
  if (tokenAddress) {
    tokenContract = getSep20Contract(tokenAddress)
    tokenContract._name = await tokenContract.name()
    tokenContract._symbol = await tokenContract.symbol()
  }

  let txTypeText = ''
  if (txType === TYPE_INCOMING) txTypeText = 'incoming '
  if (txType === TYPE_OUTGOING) txTypeText = 'outgoing '
  let response = { transactions: [] }
  if (tokenContract) {
    console.log(
      'Getting', pagination.limit, tokenContract._name,
      txTypeText + 'transaction/s',
      'of', address,
      'from block', pagination.after,
      'to block', pagination.before
    )
    response = await getSep20Transactions({
      contractAddress: tokenContract.address,
      address: address,
      type: txType,
  
      before: pagination.before,
      after: pagination.after,
      limit: pagination.limit,
      withTimestamp: withTimestamp,
    })
  } else {
    console.log(
      'Getting', pagination.limit, 'BCH',
      txTypeText + 'transaction/s',
      'of', address,
      'from block', pagination.after,
      'to block', pagination.before
    )
    response = await getTransactions({
      address: address,
      type: txType,
  
      before: pagination.before,
      after: pagination.after,
      limit: pagination.limit,
      withTimestamp: withTimestamp,
    })
  }

  console.log('Got', response.transactions.length, 'transaction/s')
  response.transactions.forEach((tx, index) => {
    console.log('Transaction:', index, `(${tx.record_type})`)
    if (showRaw) {
      console.log(showRaw)
    } else {
      console.log('\tHash:', tx.hash)
      console.log('\tBlock:', tx.block)
      console.log('\tFrom:', tx.from)
      console.log('\tTo:', tx.to)
      console.log('\tAmount:', tx.amount, tx.token ? tx.token.symbol : 'BCH')
      if (tx.timestamp) console.log('\tTimestamp:', new Date(tx.timestamp).toString())
      console.log('-----------------------------------------------------------')
    }
  })

  const blocks = response.transactions.map(tx => tx.block).filter(block => block >= 0)
  if (blocks.length) console.log('Block:', Math.min(...blocks), '=>', Math.max(...blocks))
  console.log('Pagination:', response.pagination)
}
