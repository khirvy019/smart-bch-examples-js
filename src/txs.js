import { getWallet } from "./main.js";

const wallet = getWallet()
console.log("Getting transaction count of", wallet.address, "...")
const txCount = await wallet.getTransactionCount()
console.log("Transaction count:", txCount)
