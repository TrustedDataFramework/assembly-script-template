const axios = require('axios');
const path = require('path');
const fs = require('fs');

const transaction = {
    version: 1634693120,
    type: 2,
    from: '02b5e348618a86fcd42ced0d6b64737f4a3674237ad83c39fd968db0f59a46fe88',
    signature: 'ff',
    createdAt: Math.floor(Date.now() / 1000),
    nonce: 1,
    gasPrice: 100
};

transaction.payload = fs.readFileSync(path.join(__dirname, '..', 'build', 'coin.wasm')).toString('hex');

axios
    .post('http://localhost:8888/rpc/transaction', transaction)
    .then(()=>{})
    .catch(() => console.error('err'));