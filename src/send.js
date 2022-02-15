import { utils } from 'ethers'
import { getWallet } from './main.js'
import { query } from './utils.js'

const walletIndex = 0
const recipient = ''

const amount = utils.parseEther('0.001')
const wallet = getWallet(walletIndex)

console.log("Sending", utils.formatEther(amount), "BCH to", `'${recipient}'`)
console.log(`Using wallet ${walletIndex+1}: '${wallet.address}'`)
const resp = await query("Confirm. y/n: ")
console.log(resp)