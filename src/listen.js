import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { getTokenContracts, getWallet, getProvider } from "./main.js";
import { isAddress } from './utils.js';

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

if (!isAddress(address)) {
  console.log('Invalid address:', address)
  process.exit()
}

console.log('Starting listeners for address:', address)

const contracts = getTokenContracts()
// https://advancedweb.hu/how-to-use-async-functions-with-array-foreach-in-javascript/
await Promise.all(
  contracts.map(async (contract) => {
    console.log(`${contract.address}:`, 'Setting up listener to events')
    const receiveFilter = contract.filters.Transfer(null, address);
    const sendFilter = contract.filters.Transfer(null, address);

    const tokenName = await contract.name();
    const tokenSymbol = await contract.symbol();
    contract.on([receiveFilter, sendFilter], (tx) => {
      console.log('--------------------------------------')
      console.log("Got transfer event for", tokenName, `(${tokenSymbol})`)
      console.log(tx)
    })
    console.log(`${contract.address}:`, 'Listening to token contracts event for', tokenName, `(${tokenSymbol})`)
  })
)

const provider = getProvider()
provider.on('block', async (blockNumber) => {
  const block = await provider.getBlockWithTransactions(blockNumber);
  for (const tx of block.transactions) {
    if (String(tx.to).toLowerCase() === address.toLowerCase() ||
        String(tx.from).toLowerCase() === address.toLowerCase()
    ) {
      console.log('Got new tx', tx);
    }
  }
})

console.log("Finished setting up listeners")
