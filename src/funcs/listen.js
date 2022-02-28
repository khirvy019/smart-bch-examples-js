import { utils } from 'ethers'

import { EventsEmitter, getSep20Contract, getProvider } from '../utils.js'

export const TYPE_INCOMING = 'incoming'
export const TYPE_OUTGOING = 'outgoing'

export class TransactionListener extends EventsEmitter {
  constructor(address, opts={ type: '', tokenAddress: '' }) {
    super()

    this.type = 'all'
    if (opts && opts.type === TYPE_INCOMING) type = TYPE_INCOMING
    if (opts && opts.type === TYPE_OUTGOING) type = TYPE_OUTGOING

    this.address = address

    if (opts && opts.tokenAddress) this.tokenContract = getSep20Contract(opts.tokenAddress)
    this.provider = getProvider()
  }

  startListener() {
    if (this.tokenContract) {
      if (this._eventFilter && this._tokenTransferListener) this.tokenContract.removeListener(this._eventFilter, this._tokenTransferListener)

      const receiveFilter = this.tokenContract.filters.Transfer(null, this.address)
      const sendFilter = this.tokenContract.filters.Transfer(this.address)
    
      this._eventFilter = [receiveFilter, sendFilter]
      if (this.type === TYPE_INCOMING) this._eventFilter = receiveFilter
      if (this.type === TYPE_OUTGOING) this._eventFilter = sendFilter

      const listener = (...args) => {
        this.tokenTransferListener(...args)
      }
      this.tokenContract.on(this._eventFilter, listener)
      delete this._tokenTransferListener
      this._tokenTransferListener = listener

    } else {
      const event = 'block'
      if (this._blockListener) this.provider.removeListener(event, this._blockListener)
      
      const listener = (...args) => {
        this.blockListener(...args)
      }
      this.provider.on(event, listener)
      delete this._blockListener
      this._blockListener = listener
    }

    this._running = true
  }

  stopListener() {
    if (this.tokenContract && this._eventFilter) this.tokenContract.removeListener(this._eventFilter, this.tokenTransferListener)

    const event = 'block'
    this.provider.removeListener(event, this.tokenTransferListener)
    this._running = false
  }


  /*
    Example of _raw:
    _raw: {
      hash: '0x0333a5306535d0e8665a819940fd3ac4acaecedb6cae2729797bd9972065d703',
      type: 0,
      accessList: null,
      blockHash: '0xc63076f0a2b5bee0e1f7625553bb20f630ea6f016bdab382d5cefd408a9b680c',
      blockNumber: 3307557,
      transactionIndex: 0,
      confirmations: 1,
      from: '0x8C5A01ace0EF0aFac314fC18Be47271fb4CB59bB',
      gasPrice: [BigNumber],
      gasLimit: [BigNumber],
      to: '0x7f65e43299BF60116A2d61b7b3f84915Bea1aCEd',
      value: [BigNumber],
      nonce: 63,
      data: '0x',
      r: '0x13ce6d357a89f9d8d66b9741fb8c97909afcea38d51ba6525002d3d7c43dea23',
      s: '0x0e59c204be71f43f8c8a8518cfd369277f472525c97198df61f38d1a4c5f83bf',
      v: 69,
      creates: null,
      chainId: 17,
      wait: [Function (anonymous)]
    }
  */
  async blockListener(blockNumber) {
    const block = await this.provider.getBlockWithTransactions(blockNumber)
    for (const tx of block.transactions) {
      const incoming = String(tx.to).toLowerCase() === this.address.toLowerCase()
      const outgoing = String(tx.from).toLowerCase() === this.address.toLowerCase()
      let emit = incoming || outgoing
      if (this.type === TYPE_INCOMING) emit = incoming
      if (this.type === TYPE_OUTGOING) emit = outgoing

      const _tx = {
        hash: tx.hash,
        to: tx.to,
        from: tx.from,
        value: tx.value,
        amount: utils.formatEther(tx.value),
        _raw: tx,
      }

      if (emit) this.emit('transaction', { tx: _tx })
    }
  }


  /*
    Example of _raw:
    _raw: {
      blockNumber: 3307516,
      blockHash: '0x28d19a0ed7856c223bb5b08d7424b7735a8fe484d1a0f655991f3576fc4a11e2',
      transactionIndex: 0,
      removed: false,
      address: '0xFa77D1D8AADDd9a263C7d685375EF148E268c558',
      data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      topics: [Array],
      transactionHash: '0xbca35d2acb66e13772dcaace459a9807ba1b428d2b7735bd646fa6a5ddf94acd',
      logIndex: 0,
      removeListener: [Function (anonymous)],
      getBlock: [Function (anonymous)],
      getTransaction: [Function (anonymous)],
      getTransactionReceipt: [Function (anonymous)],
      event: 'Transfer',
      eventSignature: 'Transfer(address,address,uint256)',
      decode: [Function (anonymous)],
      args: [Array]
    }
  */
  async tokenTransferListener(...args) {
    const tx = args[args.length-1]
    const parsedTx = {
      hash: tx.transactionHash,
      to: tx.args._to,
      from: tx.args._from,
      value: tx.args._value,
      amount: utils.formatEther(tx.args._value),
      _raw: tx,
    }

    if (this.tokenContract)

    this.emit('transaction', { tx: parsedTx })
  }
}
