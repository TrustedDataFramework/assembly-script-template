const rpcBaseUrl = 'http://localhost:8080';
const contractAddr = 'f22418525df37b0bc25ccb3bf4a33d1d16af68f7';
const queryAddr = 'ac9019a3c01be5056af55b43c510c3203bb9fc62';
const amount = 10;
const count = 2;

const axios = require('axios');

const parameters = Buffer.concat(
    [
        Buffer.from(['getBalance'.length]),
        Buffer.from('getBalance', 'ascii'),
        Buffer.from(`{"address": ${queryAddr}}`, 'ascii')
    ]
);

axios
    .get(`${rpcBaseUrl}/rpc/contract/${contractAddr}?parameters=` + parameters.toString('hex'))
    .then(resp => resp.data)
    .then(x => {
        console.log(x);
        return x;
    })
    .then(x => Buffer.from(x.data, 'hex'))
    .then(b => JSON.parse(b.toString('ascii')))
    .then(console.log)
    .catch(console.error)
