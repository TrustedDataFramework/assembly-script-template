const fs = require('fs')
const conf = require('./config.json')
const axios = require('axios')

const transaction = {
    version: conf.version,
    type: conf.type,
    from: conf.from,
    to: conf.to,
    signature: conf.signature,
    createdAt: Math.floor(Date.now() / 1000),
    nonce: conf.nonce,
    gasPrice: conf.gasPrice
}

transaction.payload = fs.readFileSync(conf.binary).toString('hex')

axios
    .post(conf.entrypoint, transaction)
    .then(console.log)
    .catch(console.error)

