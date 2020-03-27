const axios = require('axios');
const path = require('path');
const fs = require('fs');

const transaction = {
    version: 1634693120,
    type: 2,
    from: '02f9d915954e04107d11fb9689a6330c22199e1e830857bff076e033bbca2888d4',
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
