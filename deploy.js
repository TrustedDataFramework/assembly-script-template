const conf = require(process.env['CONFIG'] ? process.env['CONFIG'] : './deploy-config.json');
const tool = require('@salaku/js-sdk')
const sk = conf['private-key']
const pk = tool.privateKey2PublicKey(sk)
const builder = new tool.TransactionBuilder(tool.constants.POA_VERSION, sk, conf['gas-price'] || 0)
const rpc = new tool.RPC(conf.host, conf.port)

async function main(){
    const o = await tool.compileContract(conf['asc-path'], conf.source)
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

