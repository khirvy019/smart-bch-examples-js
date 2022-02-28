import { BigNumber, utils } from 'ethers'

import { getProvider, getSep20Contract } from '../utils.js'

export const TYPE_INCOMING = 'incoming'
export const TYPE_OUTGOING = 'outgoing'

export async function getTransactions({ type=null, address='', limit=5, before='latest', after=0, withTimestamp=false }) {
  const provider = getProvider()

  let queryName = 'sbch_queryTxByAddr'
  if (type === TYPE_INCOMING) queryName = 'sbch_queryTxByDst'
  else if (type === TYPE_OUTGOING) queryName = 'sbch_queryTxBySrc'

  const pagination = {
    before: 'latest',
    after: '0x0',
    limit: '0x' + limit.toString(16),
  }

  if (Number.isSafeInteger(Number(before))) pagination.before = '0x' + Number(before).toString(16)
  if (Number.isSafeInteger(Number(after))) pagination.after = '0x' + Number(after).toString(16)

  const txs = await provider.send(
    queryName,
    [
      address,
      pagination.before,
      pagination.after,
      pagination.limit,
    ]
  )
  
  const parsedTxs = txs
    .map(tx => {
      const received = String(tx.to).toLowerCase() === address.toLowerCase()
      return {
        record_type: received ? TYPE_INCOMING : TYPE_OUTGOING,
        hash: tx.hash,
        block: BigNumber.from(tx.blockNumber).toNumber(),

        amount: utils.formatEther(BigNumber.from(tx.value)),
        from: tx.from,
        to: tx.to,

        gas: utils.formatEther(BigNumber.from(tx.gas)),

        _raw: tx,          
      }
    })

  if (withTimestamp) {
    await Promise.all(
      // Returns list of promise, each run asynchronously to fetch their own timestamps from block number
      parsedTxs.map(tx => {
        if(!withTimestamp) return Promise.resolve()
        if (!tx || !tx.block) return Promise.resolve()

        // With <ethers.providers.JsonRpcBatchProvider>, each call would be compiled in one request
        return provider.getBlock(tx.block)
          .then(block => {
            tx.timestamp = BigNumber.from(block.timestamp).toNumber() * 1000
          })
          .finally(() => {
            return Promise.resolve()
          })
      })
    )
  }

  return {
    success: true,
    transactions: parsedTxs,
    pagination: pagination,
  }
}


async function _getSep20Transactions({contractAddress='', address='', before='latest', after='0x0', limit=5}) {
  if (!utils.isAddress(contractAddress)) return []

  const tokenContract = getSep20Contract(contractAddress)
  const eventFilter = tokenContract.filters.Transfer(address, address)

  const pagination = {
    before: 'latest',
    after: '0x0',
    limit: '0x' + limit.toString(16),
  }
  if (Number.isSafeInteger(before)) pagination.before = '0x' + before.toString(16)
  if (Number.isSafeInteger(after)) pagination.after = '0x' + after.toString(16)

  const logs = await tokenContract.provider.send(
    'sbch_queryLogs',
    [
      tokenContract.address,
      eventFilter.topics,
      pagination.before,
      pagination.after,
      pagination.limit,
    ]
  )

  if (!Array.isArray(logs)) return []

  const parsedTxs = logs.map(log => {
    const parsedLog = tokenContract.interface.parseLog(log)
    const received = String(parsedLog.args._to).toLowerCase() === String(address).toLowerCase()
    return {
      record_type: received ? TYPE_INCOMING : TYPE_OUTGOING,
      hash: log.transactionHash,
      block: BigNumber.from(log.blockNumber).toNumber(),

      amount: utils.formatEther(parsedLog.args._value),
      from: parsedLog.args._from,
      to: parsedLog.args._to,

      _raw: parsedLog,          
    }
  })

  return parsedTxs
}

/*
  It fetches using sbch_queryLogs since it allows a `limit` query filter.
    -sbch_queryLogs is unable to filter incoming/outgoing transfer events due to topics filter being position independent
    1. Set a new var `pseudoBefore` equal to `before` and new array `parsedTx`
    2. Query transfer events for the contract from block `after` to block `pseudoBefore` with `limit`
    3. Filter txs from step 2 based on `type`
    4. Add the filtered txs from step 3 to `parsedTx`
    4. If total filtered txs is less than `limit`, go back to step 2. But set `pseudoBefore` as the earliest block from the last txs response minus 1.
    5. Repeat until one of the conditions below is met:
      - txs returned from step 2 is zero.
      - total filtered txs is greater than or equal to the `limit` specified.
      - `pseudoBefore` is less than equal to `after`
      - Encountered empty filtered txs for an `limiter` number of time. (This condition is arbitrary, its just to prevent looping for forever)
  https://docs.smartbch.org/smartbch/developers-guide/jsonrpc#sbch_querylogs
*/
export async function getSep20Transactions({contractAddress='', type=null, address='', before='latest', after='0x0', limit=5, withTimestamp=false}) {
  if (!utils.isAddress(contractAddress)) return {
    success: false,
    error: 'Invalid token address',
  }

  if (!utils.isAddress(address)) return {
    success: false,
    error: 'Invalid address',
  }

  const tokenContract = getSep20Contract(contractAddress)
  const token = {
    address: tokenContract.address,
    name: await tokenContract.name(),
    symbol: await tokenContract.symbol(),
  }

  const parsedTxs = []
  let pseudoBefore = before

  // need to check if after is a block number
  const afterBlock = /0x[0-9a-f]/i.test(after) ? BigNumber.from(after) : Infinity
  let limiterCtr = 0
  let limiter = limit
  while(limiterCtr < limiter) {
    const txs = await _getSep20Transactions({contractAddress: tokenContract.address, address:address, before: pseudoBefore, after, limit})
    const filteredTxs = txs.filter(tx => {
      if (type === TYPE_INCOMING) return String(address).toLowerCase() === String(tx.to).toLowerCase()
      if (type === TYPE_OUTGOING) return String(address).toLowerCase() === String(tx.from).toLowerCase()

      return parsedTxs.map(tx => tx.hash).indexOf(tx.hash) < 0
    })
    if (filteredTxs.length <= 0) limiterCtr++

    parsedTxs.push(...filteredTxs)

    if (parsedTxs.length >= limit) break
    if (!txs.length) break

    const earliestBlock = Math.min(...txs.map(tx => tx.block)) - 1
    if (earliestBlock <= afterBlock) break
    pseudoBefore = '0x' + earliestBlock.toString(16)
  }

  parsedTxs.map(tx => {
    tx.token = token
    return tx
  })

  if (withTimestamp) {
    const provider = getProvider()
    // Timestamp is not returned by default since it can get costly (about 1.5kB on each tx)
    // Promise.all waits all promise to resolve before moving on
    await Promise.all(
      // Returns list of promise, each run asynchronously to fetch their own timestamps from block number
      parsedTxs.map(tx => {
        if(!withTimestamp) return Promise.resolve()
        if (!tx || !tx.block) return Promise.resolve()

        // With <ethers.providers.JsonRpcBatchProvider>, each call would be compiled in one request
        return provider.getBlock(tx.block)
          .then(block => {
            tx.timestamp = BigNumber.from(block.timestamp).toNumber() * 1000
          })
          .finally(() => {
            return Promise.resolve()
          })
      })
    )
  }

  return {
    success: true,
    transactions: parsedTxs,
  }
}
