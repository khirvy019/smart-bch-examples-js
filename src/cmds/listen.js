import { utils } from 'ethers'

import { TransactionListener, TYPE_INCOMING, TYPE_OUTGOING } from '../funcs/listen.js'
import { getWallet, getSep20Contract, query } from '../utils.js'

export const command = 'listen'
export const desc = 'Listen to new transactions of address'
export const builder = {
  wallet: {
    alias: 'w',
    desc: 'Index of wallet',
    type: 'number',
    default: 0
  },

  address: {
    alias: 'a',
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

  token: {
    alias: 't',
    desc: 'Listen to transfter events for SEP20 contract address. Listen to BCH transactions if not specified',
    type: 'string',
    default: '',
  },
}

export async function handler(argv) {
  const walletIndex = argv.wallet
  const tokenAddress = argv.token
  const txType = argv.type

  let address = argv.address
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
  var listener = null
  if (tokenContract) {
    console.log(
      'Listening for new',
      txTypeText + tokenContract._name,
      'transactions of address:',
      address,
    )

    listener = new TransactionListener(address, { type: txType, tokenAddress: tokenContract.address })
    listener.addEventListener('transaction', data => {
      console.log('Got new transaction')
      console.log(data)
      console.log('-------------------------------------------------------------')
    })
  } else {
    console.log(
      'Listening for new',
      txTypeText + 'BCH',
      'transactions of address:',
      address,
    )
    listener = new TransactionListener(address, { type: txType })
    listener.addEventListener('transaction', data => {
      console.log('Got new transaction')
      console.log(data)
      console.log('-------------------------------------------------------------')
    })
  }

  listener.startListener()
  while(true) {
    const inp = await query('Type \'stop\' to exit: ')
  
    if (inp === 'stop') {
      console.log('Stopping listeners')
      if (listener && listener.stopListener && typeof listener.stopListener === 'function') {
        listener.stopListener()
      }
      break
    }
  }  
}
