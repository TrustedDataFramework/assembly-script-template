const axios = require('axios');

const transaction = {
    version: 1634693120,
    type: 3,
    from: '02b5e348618a86fcd42ced0d6b64737f4a3674237ad83c39fd968db0f59a46fe88',
    signature: 'ff',
    createdAt: Math.floor(Date.now() / 1000),
    nonce: 3,
    gasPrice: 100,
    amount: 10000,
    to: 'a0e226637d90ab17a731e6ac264004624ebc7b36'
};

transaction.payload = Buffer.concat(
    [
        Buffer.from(['charge'.length]),
        Buffer.from('charge', 'ascii')
    ]
);

transaction.payload = transaction.payload.toString('hex');

axios
    .post('http://localhost:8888/rpc/transaction', transaction)
    .then(()=>{})
    .catch(() => console.error('err'));