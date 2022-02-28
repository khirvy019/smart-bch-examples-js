import { utils } from 'ethers'

import { getWallet, getSep20Contract } from '../utils.js'

/*
  Return Example for transaction
    Transaction: {
    nonce: 27,
    gasPrice: BigNumber { _hex: '0x0bebc200', _isBigNumber: true },
    gasLimit: BigNumber { _hex: '0xa3a7', _isBigNumber: true },
    to: '0xFa77D1D8AADDd9a263C7d685375EF148E268c558',
    value: BigNumber { _hex: '0x00', _isBigNumber: true },
    data: '0xa9059cbb0000000000000000000000007f65e43299bf60116a2d61b7b3f84915bea1aced0000000000000000000000000000000000000000000000000de0b6b3a7640000',
    chainId: 10001,
    v: 20038,
    r: '0xa20bd24798bf9fe84f6ae496f0e27d01ff4e325e5ab5dad99e94fe2a6f357eb1',
    s: '0x6e484e1b283cbff1314a84da93ff899331f3b436e7808736779db3fff49efed3',
    from: '0x8C5A01ace0EF0aFac314fC18Be47271fb4CB59bB',
    hash: '0x231dda93fd797c1ac5d5470db3d3de778a30224be0eeafe77efeb65d142ca414',
    type: null,
    confirmations: 0,
    wait: [Function (anonymous)]
  }

  `wait` function accepts 1 parameter to wait for number of confirmations. Return example for `wait` function:
  {
    to: '0xFa77D1D8AADDd9a263C7d685375EF148E268c558',
    from: '0x8C5A01ace0EF0aFac314fC18Be47271fb4CB59bB',
    contractAddress: null,
    transactionIndex: 0,
    gasUsed: BigNumber { _hex: '0x9007', _isBigNumber: true },
    logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000008000000000000000000000000008000000000001000000000000000000000000000000000000000000000010000000010000000000000000000000000000000000000000000000000000000000400000008000800000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000',
    blockHash: '0x4ee02d1520fcae4034cdd8706da8dddf75382342198a5c7b92944681af3542e8',
    transactionHash: '0x231dda93fd797c1ac5d5470db3d3de778a30224be0eeafe77efeb65d142ca414',
    logs: [
      {
        transactionIndex: 0,
        blockNumber: 3271482,
        transactionHash: '0x231dda93fd797c1ac5d5470db3d3de778a30224be0eeafe77efeb65d142ca414',
        address: '0xFa77D1D8AADDd9a263C7d685375EF148E268c558',
        topics: [Array],
        data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
        logIndex: 0,
        blockHash: '0x4ee02d1520fcae4034cdd8706da8dddf75382342198a5c7b92944681af3542e8'
      }
    ],
    blockNumber: 3271482,
    confirmations: 1,
    cumulativeGasUsed: BigNumber { _hex: '0x9007', _isBigNumber: true },
    status: 1,
    type: 0,
    byzantium: true,
    events: [
      {
        transactionIndex: 0,
        blockNumber: 3271482,
        transactionHash: '0x231dda93fd797c1ac5d5470db3d3de778a30224be0eeafe77efeb65d142ca414',
        address: '0xFa77D1D8AADDd9a263C7d685375EF148E268c558',
        topics: [Array],
        data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
        logIndex: 0,
        blockHash: '0x4ee02d1520fcae4034cdd8706da8dddf75382342198a5c7b92944681af3542e8',
        args: [Array],
        decode: [Function (anonymous)],
        event: 'Transfer',
        eventSignature: 'Transfer(address,address,uint256)',
        removeListener: [Function (anonymous)],
        getBlock: [Function (anonymous)],
        getTransaction: [Function (anonymous)],
        getTransactionReceipt: [Function (anonymous)]
      }
    ]
  }
*/
export async function sendSep20 ({contractAddress='', privateKey='', recipientAddress='', amount=0}) {
  if (!utils.isAddress(contractAddress)) return {
    success: false,
    error: 'Invalid contract address',
  }

  if (!utils.isAddress(recipientAddress)) return {
    success: false,
    error: 'Invalid recipient address',
  }

  const wallet = getWallet(-1, { privateKey })
  const contract = getSep20Contract(contractAddress)
  const contractWithSigner = contract.connect(wallet)
  const tokenName = await contractWithSigner.name()
  const symbol = await contractWithSigner.symbol()

  const parsedAmount = utils.parseEther(String(amount))
  try {
    const response = await contractWithSigner.transfer(recipientAddress, parsedAmount)
    return {
      success: true,
      token: {
        address: contractWithSigner.address,
        name: tokenName,
        symbol: symbol,
      },
      transaction: response,
    }
  } catch (e) {
    return {
      success: false,
      error: e.reason,
      _error: e,
    }
  }
}
