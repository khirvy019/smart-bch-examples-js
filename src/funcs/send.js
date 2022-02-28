import { utils } from 'ethers'

import { getWallet } from '../utils.js'

/*
  Return Example for transaction
  Transaction: {
    nonce: 1,
    gasPrice: BigNumber { _hex: '0x0bebc200', _isBigNumber: true },
    gasLimit: BigNumber { _hex: '0x65b6', _isBigNumber: true },
    to: '0x7f65e43299BF60116A2d61b7b3f84915Bea1aCEd',
    value: BigNumber { _hex: '0x038d7ea4c68000', _isBigNumber: true },
    data: '0x',
    chainId: 10001,
    v: 20038,
    r: '0xe85b08103a996bae992f4e58e525f71c9e3a7a146e8807f12a16d8937fdc9fc8',
    s: '0x4af6a04d5eaa6a7d915e43867f1ae327547c8a192dc27f04d577ef97a086c9f7',
    from: '0xe3449515cff6b1d45f3F8D6139e249E916f8E9b0',
    hash: '0x0e3dc3e24db5abea2b12fa0d5096955fb836cf4db840d611a8c8f2abbd1e2c3f',
    type: null,
    confirmations: 0,
    wait: [Function (anonymous)]
  }

  `wait` function accepts 1 parameter to wait for number of confirmations. Return example for `wait` function:
  {
    to: '0x7f65e43299BF60116A2d61b7b3f84915Bea1aCEd',
    from: '0xe3449515cff6b1d45f3F8D6139e249E916f8E9b0',
    contractAddress: null,
    transactionIndex: 0,
    gasUsed: BigNumber { _hex: '0x5208', _isBigNumber: true },
    logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    blockHash: '0x9071681b268eda102651f2f223e1cb0cc472451b561a1555d2d07d302a92d0ed',
    transactionHash: '0x7b3a44a85f2680dab0010772beb36533a1b112afb913b895ca827f799165c7ed',
    logs: [],
    blockNumber: 3271156,
    confirmations: 3,
    cumulativeGasUsed: BigNumber { _hex: '0x5208', _isBigNumber: true },
    status: 1,
    type: 0,
    byzantium: true
  }
*/
export async function sendBCH ({ privateKey='', recipientAddress='', amount=0}) {
  if (!utils.isAddress(recipientAddress)) return {
    success: false,
    error: 'Invalid recipient address',
  }

  const wallet = getWallet(-1, { privateKey })

  const parsedAmount = utils.parseEther(String(amount))
  try {
    const tx = await wallet.sendTransaction({
      to: recipientAddress,
      value: parsedAmount,
    })
    return {
      success: true,
      transaction: tx,
    }
  } catch (e) {
    return {
      success: false,
      error: e.reason,
      _error: e,
    }
  }
}
