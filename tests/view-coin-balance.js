const axios = require('axios');

const parameters = Buffer.concat(
    [
        Buffer.from(['getBalance'.length]),
        Buffer.from('getBalance', 'ascii'),
        Buffer.from(`{"address": "f0cf9664cab2b5fcd744c0ad1c02b30b6ede02a3"}`, 'ascii')
    ]
);

axios
    .get('http://localhost:8080/rpc/contract/dbaa9b3b7a874c3d9593bc03eda88ad7f537309c?parameters=' + parameters.toString('hex'))
    .then(resp => resp.data)
    .then(x => Buffer.from(x.data, 'hex'))
    .then(b => JSON.parse(b.toString('ascii')))
    .then(console.log)