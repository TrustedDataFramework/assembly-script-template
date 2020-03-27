const fromPubKey = '03810d30823bfaa055064424763bda38ef767f3ad81a259728b5c86719bcf86bf4';
const toAddr = "f22418525df37b0bc25ccb3bf4a33d1d16af68f7";
// const toAddr = "0000000000000000000000000000000000000003";

//const amount = 9223372036854775908;
const amount = 100;
const rpcBaseUrl = 'http://localhost:8080';

const axios = require('axios');
const path = require('path');
const fs = require('fs');

const transaction = {
    version: 1634693120,
    type: 1,
    from: fromPubKey,
    to: toAddr,
    signature: 'ff',
    createdAt: Math.floor(Date.now() / 1000),
    nonce: 1,
    gasPrice: 100,
    amount: amount
};

//transaction.payload = fs.readFileSync(path.join(__dirname, contractFile)).toString('hex');

axios
    .get(`${rpcBaseUrl}/rpc/account/${fromPubKey}`)
    .then(resp => resp.data)
    .then(data => {
        transaction.nonce = data.data.nonce + 1;
        return axios.post(`${rpcBaseUrl}/rpc/transaction`, transaction);
    })
    .then(() => console.log('success'))
    .catch(console.error);
