const axios = require('axios');
const path = require('path');
const fs = require('fs');

const transaction = {
    version: 1634693120,
    type: 2,
    from: '0306d7cf7659e8c51b2ee537490ca6045be3b65eb52fae1dd2100c6d63c7efb04a',
    signature: 'ff',
    createdAt: Math.floor(Date.now() / 1000),
    nonce: 1,
    gasPrice: 100
};

transaction.payload = fs.readFileSync(path.join(__dirname, '..', 'build', 'rlp-test.wasm')).toString('hex');


axios
    .post('http://localhost:8888/rpc/transaction', transaction)
    .then(()=>{})
    .catch(() => console.error('err'));