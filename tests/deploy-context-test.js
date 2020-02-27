const axios = require('axios');
const path = require('path');
const fs = require('fs');

const transaction = {
    version: 1634693120,
    type: 2,
    from: 'e54090596bcdfe5441e1e3d838cdbf5a8eed6b1fd71d105cc4f59646faadb6da',
    signature: 'ff',
    createdAt: Math.floor(Date.now() / 1000),
    nonce: 3,
    gasPrice: 100
};

transaction.payload = fs.readFileSync(path.join(__dirname, '..', 'build', 'context-test.wasm')).toString('hex');

axios
    .post('http://localhost:8080/rpc/transaction', transaction)
    .then(()=>{})
    .catch(() => console.error('err'));