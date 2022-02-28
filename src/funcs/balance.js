import { utils } from "ethers"

import { getWallet, getProvider, getSep20Contracts } from '../utils.js'

export async function getBalance({ walletIndex=-1, address='', includeTokens=false}) {
  let _address = address
  if (!_address) {
    const wallet = getWallet(walletIndex)
    _address = wallet.address
  }
  const provider = getProvider()
  const balance = await provider.getBalance(_address)

  const tokens = []
  if (includeTokens) {
    await Promise.all(
      getSep20Contracts().map(async (contract) => {
        const tokenName = await contract.name()
        const tokenSymbol = await contract.symbol()
        const balance = await contract.balanceOf(_address)
        tokens.push({
          balance: utils.formatEther(balance),
          token: {
            address: contract.address,
            name: tokenName,
            symbol: tokenSymbol,
          }
        })
      })
    )
  }

  return {
    address: _address,
    balance: utils.formatEther(balance),
    tokens: tokens,
  }
}
