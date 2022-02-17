import walletConf from './config/wallet-conf.js'
import sep20Abi from './config/sep-20-abi.js'
import { ethers } from 'ethers'

const rpcUrls = {
  test: 'http://35.220.203.194:8545/',
  main: 'https://smartbch.fountainhead.cash/mainnet'
}

export function getProvider() {
  return new ethers.providers.JsonRpcBatchProvider(walletConf.test ? rpcUrls.test : rpcUrls.main);
}

export function getWallets() {
  const provider = getProvider();
  return walletConf.wallets.map(walletInfo => {
    if (!walletInfo) return

    try {
      let wallet = ethers.Wallet.fromMnemonic(
        walletInfo.mnemonic,
        walletInfo.path,
      )
      return wallet.connect(provider)
    } catch(err) {
      return
    }

  })
}

export function getWallet(accountNo=0) {
  const provider = getProvider();
  let wallet = ethers.Wallet.fromMnemonic(
    walletConf.wallets[accountNo].mnemonic,
    walletConf.wallets[accountNo].path,
  )
  wallet = wallet.connect(provider)
  return wallet
}

export function getTokenContracts() {
  const tokenAddresses = walletConf.test ? walletConf.testTokens : walletConf.tokens

  return tokenAddresses.map(contractAddress => {
    return new ethers.Contract(
      contractAddress,
      sep20Abi,
      getProvider(),
    )
  })
}

export function getTokenContract(contractAddress) {
  return new ethers.Contract(
    contractAddress,
    sep20Abi,
    getProvider(),
  )
}
