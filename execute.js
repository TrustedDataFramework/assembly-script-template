const tool = require('@salaku/js-sdk')
const address = ''
const method = ''
const args = ''
const conf = require(process.env['CONFIG'] ? process.env['CONFIG'] : './deploy-config.json');
const sk = conf['private-key']
const pk = tool.privateKey2PublicKey(sk)

const args = tool.buildPayload(method, args)

async function main(){
    const tx = {
        version: conf.version,
        type: 3,
        createdAt: Math.floor((new Date()).valueOf() / 1000),
        nonce: conf['nonce'] ? conf['nonce'] : 0,
        from: tool.privateKey2PublicKey(sk),
        payload: tool.buildPayload(method, Buffer.from(args, 'hex')).toString('hex'),
        to: address
    }

    if(!tx.nonce)
        tx.nonce = (await tool.getNonce(conf.host, conf.port || 7010, pk)) + 1

    tool.sign(tx, sk)

    const resp = await tool.sendTransaction(conf.host, conf.port || 7010, tx)
    console.log(resp)
}

main()
.catch(console.error)
