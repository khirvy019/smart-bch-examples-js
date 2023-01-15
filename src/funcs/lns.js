/*
    ENS Spec - https://eips.ethereum.org/EIPS/eip-137
*/
import { utils, BigNumber } from "ethers"
import { getProvider } from "../utils.js"
import BCHJS from '@psf/bch-js'

const bchjs = new BCHJS()

function base58Encode(data) {
  return utils.base58.encode(
    utils.concat([
      data,
      utils.hexDataSlice(
        utils.sha256(utils.sha256(data)),
        0, 4
      )
    ])
  )
}


const provider = getProvider()
const resolver = await provider.getResolver('joemartaganna.bch')
// console.log(await resolver.getContentHash())
// console.log(await provider.lookupAddress('0x07D4115bCDb2b709ff07d0dA11f5Da7D85C5b769'))
// console.log(await provider.resolveName('mist.bch'))
const coinType = 145
const encodedCoinType = utils.hexZeroPad(BigNumber.from(coinType).toHexString(), 32)
const hexBytes = await resolver._fetchBytes('0xf1cb7e06', encodedCoinType) // 0x76a914c82c77562ec9e0524120399799329a9c7deb4d2288ac
console.log(hexBytes)
// if (hexBytes == null || hexBytes === '0x') return null


const p2pkh = hexBytes.match(/^0x76a9([0-9a-f][0-9a-f])([0-9a-f]*)88ac$/);
const p2sh = hexBytes.match(/^0xa9([0-9a-f][0-9a-f])([0-9a-f]*)87$/);
let legacyAddress = ''
if (p2pkh) {
  legacyAddress = base58Encode(utils.concat([ [ 0x00 ], ("0x" + p2pkh[2]) ]))
} else if (p2sh) {
  legacyAddress = base58Encode(utils.concat([ [ 0x05 ], ("0x" + p2sh[2]) ]))
}

const response = {
  hexBytes,
  legacyAddress,
  cashAddress: bchjs.Address.toCashAddress(legacyAddress),
  slpAddress: bchjs.SLP.Address.toSLPAddress(legacyAddress),
}

console.log(response)
