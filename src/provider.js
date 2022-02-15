import { getWallet } from "./main.js";

const wallet = getWallet()
console.log("Network:", await wallet.provider.getNetwork())
console.log("Block number: ", await wallet.provider.getBlockNumber())