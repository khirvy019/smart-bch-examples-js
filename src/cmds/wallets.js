import { getWallets } from '../utils.js'

export const command = 'wallets'
export const desc = 'List details of wallet'
export const builder = {
  mnemonic: {
    alias: 'm',
    desc: 'Show mnemonic',
    type: 'boolean',
    default: false
  },
}
export function handler (argv) {
  const showMnemonic = argv.mnemonic
  const wallets = getWallets()
  console.log(wallets.length, 'wallet/s listed')
  wallets.forEach((wallet, index) => {
    console.log('Wallet', `${index+1}:`)
    console.log('Address:', wallet.address)
    if (showMnemonic) console.log('Mnemonic:', wallet.mnemonic)
    console.log('----------------------------')
  })
}
