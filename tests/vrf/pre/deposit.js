const rpcBaseUrl = 'http://localhost:8080';
const contractAddr = '0000000000000000000000000000000000000001';
const fromPubKey = '03db73ea4b9eb3f0f9d46034f194ba098229841133467a209070207b75a202db8b';
const depositAmount = 1000;

const axios = require('axios');

const transaction = {
    version: 1634693120,
    type: 3,
    from: fromPubKey,
    signature: 'ff',
    createdAt: Math.floor(Date.now() / 1000),
    nonce: 0,
    gasPrice: 1,
    amount: 0,
    to: contractAddr
};

transaction.payload = Buffer.concat(
    [
        Buffer.from(['deposit'.length]),
        Buffer.from('deposit', 'ascii'),
        Buffer.from(`{"depositAmount": ${depositAmount}}`, 'ascii')
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
