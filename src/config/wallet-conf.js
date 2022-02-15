export default {
  // providers
  test: true,
  rpcUrls: {
    test: 'http://35.220.203.194:8545/',
    main: 'https://smartbch.fountainhead.cash/mainnet',
  },

  // wallet credentials
  wallets: [
    {
      mnemonic: "electric legal eight crack series tomorrow donkey renew permit know bonus toss",
      path: "m/44'/60'/0'/0/0",
    },
    {
      mnemonic: "fortune ketchup cancel trigger client modify crack winner comfort hotel crop fatal",
      path: "m/44'/60'/0'/0/0",
    },
  ],

  // token addresses
  tokens: [
    "0xe11829a7d5d8806bb36e118461a1012588fafd89", // spice
    "0x265bD28d79400D55a1665707Fa14A72978FA6043", // cats
  ],
  testTokens: [
    "0x9E06bF2B60f42e5bA8E0c9BDfB2242924d09fD78", // amm
    "0x2618B5927957969B346E60694e77213923eb11e5", // art
    "0xd3063d326d528c614df2Ab23D0C1A2C701F839EA", // cvt
    "0x4cA751A20FE9b130c0fa598DA21348B20108f51a", // scf        
  ]
}
