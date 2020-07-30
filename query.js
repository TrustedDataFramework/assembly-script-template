const tool = require('@salaku/js-sdk')
const address = ''
const method = ''
const parameters = ''
const conf = require(process.env['CONFIG'] ? process.env['CONFIG'] : './deploy-config.json');
const sk = conf['private-key']
const pk = tool.privateKey2PublicKey(sk)

const args = tool.buildPayload(method, args)

axios
.get(`http://${conf.host}:${conf.port}/rpc/contract/${address}?parameters=${args.toString('hex')}` )
    .then(resp => resp.data.data)
    .then()