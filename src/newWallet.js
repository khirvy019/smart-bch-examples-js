import { ethers } from 'ethers';

const wallet = ethers.Wallet.createRandom()
console.log("Creating new wallet")
console.log("Public address:", wallet.address)
console.log("Mnemonic:")
console.log("\tPhrase:", wallet.mnemonic.phrase)
console.log("\tPath:", wallet.mnemonic.path)
