const axios = require('axios');
const path = require('path');
const fs = require('fs');

const transaction = {
    version: 1634693120,
    type: 2,
    from: '593a62a354bcce8eff869f355b8d0931a66829ae481ec11edea25eb9378956a6',
    signature: 'ff',
    createdAt: Math.floor(Date.now() / 1000),
    nonce: 1,
    gasPrice: 100
};

transaction.payload = fs.readFileSync(path.join(__dirname, '..', 'build', 'coin.wasm')).toString('hex');

axios
    .post('http://localhost:8080/rpc/transaction', transaction)
    .then(()=>{})
    .catch(() => console.error('err'));