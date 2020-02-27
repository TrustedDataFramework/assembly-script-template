const axios = require('axios');

const transaction = {
    version: 1634693120,
    type: 3,
    from: 'e54090596bcdfe5441e1e3d838cdbf5a8eed6b1fd71d105cc4f59646faadb6da',
    signature: 'ff',
    createdAt: Math.floor(Date.now() / 1000),
    nonce: 2,
    gasPrice: 100,
    to: 'dee94526fee50cc54393ab57d8c924040ecfafdf'
};

transaction.payload = Buffer.concat(
    [Buffer.from(['invoke'.length]), Buffer.from('invoke', 'ascii')]
);

transaction.payload = transaction.payload.toString('hex');

axios
    .post('http://localhost:8080/rpc/transaction', transaction)
    .then(()=>{})
    .catch(() => console.error('err'));