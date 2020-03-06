const axios = require('axios');

const transaction = {
    version: 1634693120,
    type: 3,
    from: '0306d7cf7659e8c51b2ee537490ca6045be3b65eb52fae1dd2100c6d63c7efb04a',
    signature: 'ff',
    createdAt: Math.floor(Date.now() / 1000),
    nonce: 2,
    gasPrice: 100,
    to: '5e27a74398717c630602b70a76003ad48169299b'
};

transaction.payload = Buffer.concat(
    [
        Buffer.from(['invoke'.length]),
        Buffer.from('invoke', 'ascii')
    ]
);

transaction.payload = transaction.payload.toString('hex');

axios
    .post('http://localhost:8888/rpc/transaction', transaction)
    .then(()=>{})
    .catch(() => console.error('err'));