const rpcBaseUrl = 'http://localhost:8080';
const contractAddr = 'f22418525df37b0bc25ccb3bf4a33d1d16af68f7';
const fromPubKey = '03f5058c783199b83259b11d44a30255faaada47270baa6aa132efd2366ea4b304';
const amount = 10;
const count = 2;

const axios = require('axios');

const transaction = {
    version: 1634693120,
    type: 3,
    from: fromPubKey,
    signature: 'ff',
    createdAt: Math.floor(Date.now() / 1000),
    nonce: 2,
    gasPrice: 1,
    amount: amount,
    to: contractAddr
};

transaction.payload = Buffer.concat(
    [
        Buffer.from(['charge'.length]),
        Buffer.from('charge', 'ascii')
    ]
);

transaction.payload = transaction.payload.toString('hex');


//const fn = () =>
axios
    .get(`${rpcBaseUrl}/rpc/account/${fromPubKey}`)
    .then(resp => resp.data)
    .then(data => {
        const body = [];
        transaction.nonce = data.data.nonce + 1;
        body.push(JSON.parse(JSON.stringify(transaction)));
        return axios.post(`${rpcBaseUrl}/rpc/transaction`, body);
    })
    .then(() => console.log('success'))
    .catch(console.error);


//setInterval(fn , 3000);
