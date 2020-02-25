const fs = require('fs');
const axios = require('axios');
const program = require('commander');

program
    .option("--config -c <string>", "configuration file");

program.parse(process.argv);

const conf = require(program.config ? program.config : './deploy-config.json');

const transaction = {
    version: conf.version,
    type: conf.type,
    from: conf.from,
    to: conf.to,
    signature: conf.signature,
    createdAt: Math.floor(Date.now() / 1000),
    nonce: conf.nonce,
    gasPrice: conf.gasPrice
};

transaction.payload = fs.readFileSync(conf.binary).toString('hex');

axios
    .post(conf.endpoint, transaction)
    .then(()=>{})
    .catch(() => console.error('err'))

