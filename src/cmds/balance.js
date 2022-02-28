import { getBalance } from '../funcs/balance.js'

export const command = 'balance'
export const desc = 'Show balance of wallet'
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
    default: ''
  },
  
  'include-tokens': {
    alias: 't',
    desc: 'Include balance of listed sep20 tokens listed in config',
    type: 'boolean',
    default: false
  }
}

export async function handler (argv) {
  const wallet = argv.wallet
  const address = argv.address
  const includeTokens = argv['include-tokens']

  const result = await getBalance({walletIndex: wallet, address, includeTokens})
  console.log('Address:', result.address)
  console.log('Balance:', result.balance, 'BCH')
  if (Array.isArray(result.tokens) && result.tokens.length) {
    console.log('\nSEP20 tokens:')
    result.tokens.forEach((tokenBalance, index) => {
      console.log('Token', index+1)
      console.log('\t', tokenBalance.token.name)
      console.log('\tAddress:', tokenBalance.token.address)
      console.log('\t', tokenBalance.balance, tokenBalance.token.symbol)
      console.log('----------------------------')
    })
  }
}
