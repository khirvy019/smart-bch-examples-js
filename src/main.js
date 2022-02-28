import yargs from 'yargs'

import * as balance from './cmds/balance.js'
import * as listErc721 from './cmds/list-erc721.js'
import * as listen from './cmds/listen.js'
import * as sendSep20 from './cmds/send-sep20.js'
import * as send from './cmds/send.js'
import * as txs from './cmds/txs.js'
import * as wallets from './cmds/wallets.js'

yargs(process.argv.slice(2))
  .command(balance)
  .command(listErc721)
  .command(listen)
  .command(sendSep20)
  .command(send)
  .command(txs)
  .command(wallets)
  .demandCommand()
  .help()
  .argv
