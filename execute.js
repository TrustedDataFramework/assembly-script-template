const tool = require('@salaku/js-sdk')
const address = ''
const method = ''
const args = ''
const conf = require(process.env['CONFIG'] ? process.env['CONFIG'] : './deploy-config.json');
const sk = conf['private-key']
const pk = tool.privateKey2PublicKey(sk)

const args = tool.buildPayload(method, args)


const tx = {
    version: conf.version,
    type: 3,
    createdAt: Math.floor((new Date()).valueOf() / 1000),
    nonce: conf['nonce'] ? conf['nonce'] : 0,
    from: tool.privateKey2PublicKey(sk),
    payload: tool.buildPayload(method, Buffer.from(args, 'hex')),
    to: address
}

const p = tx.nonce ? Promise.resolve(tx) :
    tool.getNonce(conf.host, conf.port || 7010, pk)
        .then(n => {
            tx.nonce = n
            return tx
        })

p.then(tx => {
    tool.sign(tx, sk)
    return tx
})
.then(tx => tool.sendTransaction(conf.host, conf.port || 7010, tx))
.then(console.log)
.catch(console.error)

