const tool = require('@salaku/js-sdk')
const address = ''
const method = ''

const conf = require(process.env['CONFIG'] ? process.env['CONFIG'] : './deploy-config.json');

async function main() {
    const re = await tool.viewContract(
        conf.host,
        conf.port || 7010,
        address,
        method,
        Buffer.from('ff', 'hex')
    )

    console.log(re)
}

main()
    .catch(console.error)
