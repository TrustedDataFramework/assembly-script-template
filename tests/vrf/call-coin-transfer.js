const rpcBaseUrl = 'http://localhost:8080';
const fromPubKey = '03f5058c783199b83259b11d44a30255faaada47270baa6aa132efd2366ea4b304';
const contractAddr = 'f22418525df37b0bc25ccb3bf4a33d1d16af68f7';
const toAddr = 'ac9019a3c01be5056af55b43c510c3203bb9fc62';
const amount = 20;

const axios = require('axios');
const transaction = {
    version: 1634693120,
    type: 3,
    from: fromPubKey, // Sender pub key
    signature: 'ff',
    createdAt: Math.floor(Date.now() / 1000),
    nonce: 6,
    gasPrice: 100,
    to: contractAddr // Contract address
};

//function name and function args
transaction.payload = Buffer.concat(
    [
        Buffer.from(['transfer'.length]),
        Buffer.from('transfer', 'ascii'),
        Buffer.from(`{"to": "${toAddr}","amount": ${amount}}`, 'ascii')
    ]
);

transaction.payload = transaction.payload.toString('hex');

axios
    .get(`${rpcBaseUrl}/rpc/account/${fromPubKey}`)
    .then(resp => resp.data)
    .then(data => {
        const body = [];
        transaction.nonce = data.data.nonce + 1;
          console.log('Nonce: '+transaction.nonce)
          body.push(JSON.parse(JSON.stringify(transaction)));
          transaction.nonce++;
        return axios.post(`${rpcBaseUrl}/rpc/transaction`, body);
    })
    .then(() =>
  console.log('success'))
  .catch(console.error);
