const axios = require('axios');

const parameters = Buffer.concat(
    [
        Buffer.from(['getBalance'.length]),
        Buffer.from('getBalance', 'ascii'),
        Buffer.from(`{"address": "38842c0c2c4caadaf88af398777f274637c3dbce"}`, 'ascii')
    ]
);

axios
    .get('http://localhost:8888/rpc/contract/a0e226637d90ab17a731e6ac264004624ebc7b36?parameters=' + parameters.toString('hex'))
    .then(resp => resp.data)
    .then(x => {
        console.log(x);
        return x;
    })
    .then(x => Buffer.from(x.data, 'hex'))
    .then(b => JSON.parse(b.toString('ascii')))
    .then(console.log)
    .catch(console.error)