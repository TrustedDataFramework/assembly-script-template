/**
 * 智能合约部署示例
 */
const tool = require('@salaku/js-sdk')
const path = require('path')

// 读取配置
const conf = require(process.env['CONFIG'] ? path.join(process.cwd(), process.env['CONFIG']) : path.join(process.cwd(), './config.json'));
const sk = conf['private-key']
const pk = tool.privateKey2PublicKey(sk)

// 事务构造工具
const builder = new tool.TransactionBuilder(conf.version, sk, conf['gas-price'] || 0)
// rpc 工具
const rpc = new tool.RPC(conf.host, conf.port)

async function main(){
    // 编译合约得到二进制内容
    const o = await tool.compileContract(conf['asc-path'], conf.source)
    // 构造合约部署的事务
    const tx = builder.buildDeploy(o, 0)

    if(!tx.nonce){
        tx.nonce = (await rpc.getNonce(pk)) + 1
    }

    tool.sign(tx, sk)
    console.log(`contract address = ${tool.getContractAddress(pk, tx.nonce)}`)
    const resp = await tool.sendTransaction(conf.host, conf.port, tx)
    console.log(resp)
}

main().catch(console.error)

