import { ethers } from 'ethers'
import * as config from './config/index.js'


export function getProvider() {
  return new ethers.providers.JsonRpcBatchProvider(config.network.test ? config.network.rpcUrls.test : config.network.rpcUrls.main);
}

export function getWallet(accountNo=0, walletInfo={mnemonic: '', path: '', privateKey: ''}) {
  const _walletInfo = {
    mnemonic: '',
    path: '',
    privateKey: '',
  }

  if (Number.isSafeInteger(accountNo) && accountNo < config.wallets.length && accountNo >= 0) {
    _walletInfo.mnemonic = config.wallets[accountNo].mnemonic
    _walletInfo.path = config.wallets[accountNo].path
  } else if (walletInfo && walletInfo.mnemonic && walletInfo.path) {
    _walletInfo.mnemonic = walletInfo.mnemonic
    _walletInfo.path = walletInfo.path
  } else if (walletInfo && walletInfo.privateKey) {
    _walletInfo.privateKey = walletInfo.privateKey
  }

  const provider = getProvider();
  if (_walletInfo.mnemonic && _walletInfo.path) {
    const wallet = ethers.Wallet.fromMnemonic(
      _walletInfo.mnemonic,
      _walletInfo.path,
    )
    return wallet.connect(provider)
  } else if (_walletInfo.privateKey) {
    return new ethers.Wallet(_walletInfo.privateKey, provider)
  }

  return
}

export function getWallets() {
  return config.wallets.map((_, index) => {
    try {
      return getWallet(index)
    } catch(err) {
      return
    }
  })
}

export function getSep20Contract(contractAddress) {
  return new ethers.Contract(
    contractAddress,
    config.abi.sep20,
    getProvider(),
  )
}

export function getSep20Contracts() {
  const tokenAddresses = config.network.test ? config.testTokens : config.tokens

  return tokenAddresses.map(contractAddress => getSep20Contract(contractAddress))
}

export function getERC721Contract(contractAddress) {
  return new ethers.Contract(
    contractAddress,
    config.abi.erc721,
    getProvider(),
  )
}

export async function query(text) {
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdout.write(text);
    process.stdin.once("data", function (data) {
      resolve(data.toString().trim())
      process.stdin.pause()
    })
  })
}


export class EventsEmitter {
  constructor () {
    this._subscriptionMap = {}
  }

  addEventListener(eventName, listener) {
    if (!Array.isArray(this._subscriptionMap[eventName])) this._subscriptionMap[eventName] = []

    this._subscriptionMap[eventName].push(listener)
  }

  removeEventListener(listener) {
    Object.getOwnPropertyNames(this._subscriptionMap)
      .forEach(eventName => {
        if (!Array.isArray(this._subscriptionMap[eventName])) return

        this._subscriptionMap[eventName] = this._subscriptionMap[eventName]
          .filter(_listener => _listener !== listener)
      })
  }

  removeEventListeners(eventName) {
    this._subscriptionMap[eventName] = []
  }

  emit(eventName, ...args) {
    if (!Array.isArray(this._subscriptionMap[eventName])) return
    this._subscriptionMap[eventName]
      .forEach(listener => {
        if (!listener || !listener.call) return

        listener(...args)
      })
  }
}
