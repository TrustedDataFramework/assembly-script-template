/**
 * 智能合约调用示例
 */

const tool = require('@salaku/js-sdk')
const address = '****'

// 调用 increment 方法
const method = 'increment'
const args = ''

// 读取配置
const conf = require(process.env['CONFIG'] ? path.join(process.cwd(), process.env['CONFIG']) : path.join(process.cwd(), './config.json'));
const sk = conf['private-key']
// 把私钥转成公钥
const pk = tool.privateKey2PublicKey(sk)

// 事务构造工具
const builder = new tool.TransactionBuilder(conf.version, sk, conf['gas-price'] || 0)
// rpc 工具
const rpc = new tool.RPC(conf.host, conf.port)



// 主函数
async function main(){
    // 构造 payload
    const payload = tool.buildPayload(method, args)
    // 构造事务
    const tx = builder.buildContractCall(address, tool.buildPayload(method, Buffer.from(args, 'hex')), 0)

    if(!tx.nonce)
        tx.nonce = (await tool.getNonce(conf.host, conf.port || 7010, pk)) + 1

    builder.sign(tx)
    return await rpc.sendTransaction(tx)
}

main()
.then(console.log)
.catch(console.error)
