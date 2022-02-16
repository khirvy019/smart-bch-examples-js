import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { BigNumber, utils } from 'ethers';
import { getWallet, getTokenContracts } from './main.js';

const argv = await yargs(hideBin(process.argv))
  .usage([
    '$0 [-w|--wallet=0]\n',
    'Shows latest transactions of address. Also shows latest transactions of listed SEP20 tokens',
  ].join('\n'))
  .option('wallet', {
    alias: 'w',
    desc: 'Index of wallet to use in config/wallet-conf.js',
    number: true,
    default: 0,
  })
  .option('raw', {
    desc: 'Show raw json transactions',
    boolean: true,
    default: false,
  })
  .option('number', {
    alias: 'n',
    desc: 'Number of transactions to show',
    number: true,
    default: 10,
  })
  .parse()

const walletIndex = argv.wallet
const showRaw = argv.raw
const txCount = argv.number
const wallet = getWallet(walletIndex)


console.log('Getting latest', txCount, 'transaction/s of', wallet.address)

// See json rpc docs for other functions:
// https://docs.smartbch.org/smartbch/developers-guide/jsonrpc#sbch
const txs = await wallet.provider.send(
  'sbch_queryTxByAddr',
  [
    wallet.address,
    'latest',
    '0x0',
    '0x' + txCount.toString(16),
  ]
)

console.log('Got', txs.length, 'transaction/s')
if (showRaw) {
  console.log(txs)
} else {
  txs.forEach((tx, index) => {
    const received = tx.to.toLowerCase() === wallet.address.toLowerCase()
    console.log(
      `${index}:`,
      received ? 'Received' : 'Sent',
      utils.formatEther(BigNumber.from(tx.value)),
      'BCH', 
      received ? 'from' : 'to',
      received ? tx.from : tx.to,
      'at block',
      BigNumber.from(tx.blockNumber).toNumber(),
    )
  })
}

const tokenContracts = getTokenContracts()
console.log('Getting transactions for tokens')

for (var i = 0; i < tokenContracts.length; i++) {
  const tokenContract = tokenContracts[i]
  const tokenName = await tokenContract.name()
  const symbol = await tokenContract.symbol()
  console.log('Getting latest', txCount, 'transaction/s for', tokenName, `(${symbol})`)

  const eventFilter = tokenContract.filters.Transfer(wallet.address, wallet.address)
  const logs = await tokenContract.provider.send(
    'sbch_queryLogs',
    [
      tokenContract.address,
      eventFilter.topics,
      'latest',
      '0x0',
      '0x' + txCount.toString(16),
    ]
  )

  console.log('Got', logs.length, 'transaction/s')
  logs.forEach((log, index) => {
    const parsedLog = tokenContract.interface.parseLog(log)
    if (showRaw) {
      console.log('Log', index, ':', parsedLog)
    } else {
      const received = String(parsedLog.args._to).toLowerCase === wallet.address.toLowerCase()
      console.log(
        'Tx', index, ':',
        received ? 'Received' : 'Sent',
        utils.formatEther(parsedLog.args._value),
        symbol,
        received ? 'from' : 'to',
        received ? parsedLog.args._from : parsedLog.args._to,
      )
    }
  })
}