import { utils } from 'ethers'

import { getERC721Contract, query } from '../utils.js'

import { listERC721Tokens } from '../funcs/list-erc721.js'

export const command = 'list-erc721'
export const desc = 'List tokens of an ERC721 contract'
export const builder = {
  token: {
    alias: 't',
    desc: 'Address of ERC721 contract',
    type: 'string',
  },

  address: {
    alias: 'a',
    desc: 'Filter tokens owned by address',
    type: 'string',
    default: ''
  },

  limit: {
    alias: 'l',
    desc: 'Number of tokens to show',
    type: 'number',
    default: 5,
  },

  offset: {
    alias: 'o',
    desc: 'Start index of the token in the list to show',
    type: 'number',
    default: 0,
  },

  'include-metadata': {
    alias: 'm',
    desc: 'Include metadata of tokens',
    type: 'boolean',
    default: false,
  }
}

export async function handler (argv) {
  let contractAddress = argv.token
  const limit = argv.limit
  const offset = argv.offset
  const address = argv.address
  const includeMetadata = argv['include-metadata']

  while(!utils.isAddress(contractAddress)) {
    const prompt = contractAddress ? 'Invalid token address, please input an address:' : 'Please input a token address:'
    contractAddress = await query(prompt)
    contractAddress = contractAddress.trim()
  }

  const contract = getERC721Contract(contractAddress)
  const tokenName = await contract.name()

  console.log('Listing ERC721 Tokens of', tokenName)
  console.log('Address:', contract.address)
  console.log('Limit:', limit, ', Offset:', offset)
  if (address) console.log('Filtering to tokens owned by:', address)

  const response = await listERC721Tokens({
    contractAddress: contractAddress,
    limit: limit,
    offset: offset,
    address: address,
    includeMetadata: includeMetadata,
    asyncMetadata: false,
  })

  if (response.success) {
    console.log('Got', response.tokens.length, 'token/s')
    if (includeMetadata) {
      response.tokens.forEach((token, index) => {
        console.log('Token ID:', token.id)
        console.log('Metadata URL:', token.metadata_url)
        console.log('Metadata:', token.metadata)
        console.log('---------------------------------------------------')
      })
    } else {
      console.log('TokenIDs:', response.tokens.map(token => token.id))
    }
  } else {
    console.log('Error fetching tokens:', response.error)
  }
}
