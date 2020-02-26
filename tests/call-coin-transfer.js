const axios = require('axios');

const transaction = {
    version: 1634693120,
    type: 3,
    from: 'e54090596bcdfe5441e1e3d838cdbf5a8eed6b1fd71d105cc4f59646faadb6da',
    signature: 'ff',
    createdAt: Math.floor(Date.now() / 1000),
    nonce: 2,
    gasPrice: 100,
    to: 'dbaa9b3b7a874c3d9593bc03eda88ad7f537309c'
};

transaction.payload = Buffer.concat(
    [
        Buffer.from(['transfer'.length]),
        Buffer.from('transfer', 'ascii'),
        Buffer.from(`{"to": "f0cf9664cab2b5fcd744c0ad1c02b30b6ede02a3","amount": 1000}`, 'ascii')
    ]
);

transaction.payload = transaction.payload.toString('hex');

axios
    .post('http://localhost:8080/transaction', transaction)
    .then(()=>{})
    .catch(() => console.error('err'));