import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { utils } from 'ethers'

import { getProvider, getWallet, getTokenContracts } from "./main.js";
import { query } from "./utils.js";

const argv = await yargs(hideBin(process.argv))
  .usage([
    '$0 [-w|--wallet=0] | [-a|--adddress=<0x0000>]\n',
    'Watches new transactions of a address/wallet. Also watches transactions of listed SEP20 tokens',
  ].join('\n'))
  .option('wallet', {
    alias: 'w',
    desc: 'Index of wallet to use in config/wallet-conf.js',
    number: true,
    default: -1,
  })
  .option('address', {
    alias: 'a',
    desc: 'Specific address to watch',
    string: true,
    default: '',
  })
  .parse()

const walletIndex = argv.wallet
let address = argv.address


if (walletIndex >= 0) {
  const wallet = getWallet(walletIndex)
  address = wallet.address
}

if (!utils.isAddress(address)) {
  console.log('Invalid address:', address)
  process.exit()
}

console.log('Starting listeners for address:', address)

export async function watchTransactions(address, callback) {
  if (!utils.isAddress(address)) return

  const contracts = getTokenContracts()
  const cancelWatchFunctions = []
  const tokensWatched = []
  await Promise.all(
    contracts.map(async (contract) => {
      const receiveFilter = contract.filters.Transfer(null, address);
      const sendFilter = contract.filters.Transfer(null, address);
  
      const tokenName = await contract.name();
      const tokenSymbol = await contract.symbol();
      const eventFilter = [receiveFilter, sendFilter]
      const eventCallback = (tx) => {
        callback({
          tx: {
            hash: tx.transactionHash,
            to: tx.args._to,
            from: tx.args._from,
            value: tx.args._value,
            _raw: tx,
          },
          token: {
            address: contract.address,
            name: tokenName,
            symbol: tokenSymbol,
          }
        })
      }
      
      contract.on(eventFilter, eventCallback)
      tokensWatched.push({
        address: contract.address,
        name: tokenName,
        symbol: tokenSymbol,
      })

      cancelWatchFunctions.push(function () {
        contract.removeListener(eventFilter, eventCallback)
      })
    })
  )
  
  const provider = getProvider()
  const event = 'block'
  const eventCallback = async (blockNumber) => {
    const block = await provider.getBlockWithTransactions(blockNumber);
    for (const tx of block.transactions) {
      if (String(tx.to).toLowerCase() === address.toLowerCase() ||
          String(tx.from).toLowerCase() === address.toLowerCase()
      ) {
        callback({
          tx: {
            hash: tx.hash,
            to: tx.to,
            from: tx.from,
            value: tx.value,
            _raw: tx,
          },
        })
      }
    }
  }
  provider.on(event, eventCallback)
  cancelWatchFunctions.push(function () {
    provider.removeListener(event, eventCallback)
  })

  return {
    tokens: tokensWatched,
    stop: () => {
      cancelWatchFunctions.forEach(stopFunc => stopFunc())
    }
  }
}

const { tokens, stop: stopFunc  } = await watchTransactions(address, ({ tx, token }) => {
  if (token) console.log('Got token transaction for', token.name, `(${token.symbol})`)
  else console.log('Got transaction')

  const received = String(tx.to).toLowerCase() === address.toLowerCase()
  console.log(
    received ? 'Received' : 'Sent',
    utils.formatEther(tx.value),
    token ? token.symbol : 'BCH',
    received ? 'from' : 'to',
    received ? tx.from : tx.to,
  )

  console.log(tx)
  console.log('--------------------------------')
})

tokens.forEach(token => {
  console.log(`${token.address}:`, 'Listening to token contracts event for', token.name, `(${token.symbol})`)
})

while(true) {
  const inp = await query('Type \'stop\' to exit: ')

  if (inp === 'stop') {
    console.log('Stopping listeners')
    stopFunc()
    break
  }
}
