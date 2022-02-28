import axios from 'axios';
import { utils } from 'ethers'
import { getERC721Contract } from '../utils.js'

export async function getNFTMetadata({ contractAddress='', tokenID=-1 }) {
  if (!utils.isAddress(contractAddress)) return {
    success: false,
    error: 'Invalid token address',
  }

  const contract = getERC721Contract(contractAddress)
  const uri = await contract.tokenURI(tokenID)
  let success = false
  let data = null
  let error = undefined
  try {
    const response = await axios.get(uri)
    success = true
    data = response.data
  } catch (err) {
    success = false
    error = err
  }

  return {
    success: success,
    id: tokenID,
    address: contract.address,
    url: uri,
    data: data,
    error: error,
  }

}

/**
 * @dev Get's list of tokens for an erc721 token
 * @param {string}  contractAddress address of the smart contract
 * @param {number}  limit number of tokens to receive
 * @param {number}  offset index of token to start. See ERC721 enumerable
 * @param {string}  address if not empty, will to list tokens that are owned by the address
 * @param {bool}    includeMetadata flag to include metadata in response. See ERC721 metadata
 * @param {bool}    asyncMetadata flag to fetch the metadatta async. Only meaningful with `includeMetadata`
 * @param {func}    metadataCallback function to call when a token metadata is fetched. Recommended if `asyncMetadata` is set.
 * 
 * - Metadata is not fetched by default as it can get costly
 * - Added fetching metadata asynchronously to allow partial response with less response time
 */
export async function listERC721Tokens({
  contractAddress='',
  limit=10, offset=0,
  address='',
  includeMetadata=false,
  asyncMetadata=true,
  metadataCallback=()=>{},
}) {
  if (!utils.isAddress(contractAddress)) return {
    success: false,
    error: 'Invalid contract address',
  }

  const contract = getERC721Contract(contractAddress)

  let balance = 0
  if (address) balance = await contract.balanceOf(address)
  else balance = await contract.totalSupply()

  const startIndex = Math.min(offset, balance)
  const endIndex = Math.min(offset+limit, balance)

  const promises = []
  for (var i = startIndex; i < endIndex; i++) {
    if (address) promises.push(contract.tokenOfOwnerByIndex(this._wallet.address, i))
    else promises.push(contract.tokenByIndex(i))
  }

  const tokenIDs = await Promise.all(promises)
  const parsedTokens = tokenIDs.map(tokenID => {
    return {
      id: tokenID.toNumber(),
      contractAddress: contract.address,
    }
  })

  if (includeMetadata) {
    const metadataPromises = Promise.all(parsedTokens.map(async (token, index) => {
      const {url, data} = await getNFTMetadata({contractAddress: contract.address, tokenID: token.id})
      token.metadata_url = url
      token.metadata = data
      if (typeof metadataCallback === 'function') metadataCallback(token, index)
      return Promise.resolve()
    }))

    if (!asyncMetadata) await metadataPromises
  }

  return {
    success: true,
    tokens: parsedTokens,
    pagination: {
      count: balance,
      limit: limit,
      offset: offset,
    }
  }
}
