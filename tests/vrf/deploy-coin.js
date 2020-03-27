const fromPubKey = '03f5058c783199b83259b11d44a30255faaada47270baa6aa132efd2366ea4b304';
const contractFile = '../../build/coin.wasm'; // Relative path
const rpcBaseUrl = 'http://localhost:8080';

const axios = require('axios');
const path = require('path');
const fs = require('fs');

const transaction = {
    version: 1634693120,
    type: 2,
    from: fromPubKey,
    signature: 'ff',
    createdAt: Math.floor(Date.now() / 1000),
    nonce: 1,
    gasPrice: 100
};

transaction.payload = fs.readFileSync(path.join(__dirname, contractFile)).toString('hex');

axios
    .get(`${rpcBaseUrl}/rpc/account/${fromPubKey}`)
    .then(resp => resp.data)
    .then(data => {
        transaction.nonce = data.data.nonce + 1;
        return axios.post(`${rpcBaseUrl}/rpc/transaction`, transaction);
    })
    .then(() => console.log('success'))
    .catch(console.error);

/*
axios
    .post(`${rpcBaseUrl}/rpc/transaction`, transaction)
    .then(()=>{})
    .catch(() => console.error('err'));
*/
