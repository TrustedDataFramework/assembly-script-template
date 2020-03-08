const from =
    '02f9d915954e04107d11fb9689a6330c22199e1e830857bff076e033bbca2888d4';

const entry = 'http://localhost:7080';
const count = 1000;
const axios = require('axios');

const transaction = {
    version: 1634693120,
    type: 3,
    from: from,
    signature: 'ff',
    createdAt: Math.floor(Date.now() / 1000),
    nonce: 2,
    gasPrice: 1,
    amount: 1,
    to: 'e8a71957d03e72210275e0b5a18614861adfd3b1'
};

transaction.payload = Buffer.concat(
    [
        Buffer.from(['charge'.length]),
        Buffer.from('charge', 'ascii')
    ]
);

transaction.payload = transaction.payload.toString('hex');


const fn = () => axios
    .get(`${entry}/rpc/account/${from}`)
    .then(resp => resp.data)
    .then(data => {
        const body = [];
        transaction.nonce = data.data.nonce + 1;
        for (let i = 0; i < count; i++) {
            body.push(JSON.parse(JSON.stringify(transaction)));
            transaction.nonce++;
        }
        return axios.post(`${entry}/rpc/transaction`, body);
    })
    .then(() => console.log('success'))
    .catch(console.error);


setInterval(fn , 3000);

