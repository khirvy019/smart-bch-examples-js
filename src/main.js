import walletConf from './config/wallet-conf.js'
import sep20Abi from './config/sep-20-abi.js'
import { ethers } from 'ethers'

const rpcUrls = {
  test: 'http://35.220.203.194:8545/',
  main: 'https://smartbch.fountainhead.cash/mainnet'
}

export function getProvider() {
  return new ethers.providers.JsonRpcProvider(walletConf.test ? rpcUrls.test : rpcUrls.main);
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
  const contracts = []
  if (Array.isArray(tokenAddresses)) {
    tokenAddresses.forEach(contractAddress => {
      contracts.push(new ethers.Contract(
        contractAddress,
        sep20Abi,
        getProvider(),
      ))
    })
  }
  return contracts
}
