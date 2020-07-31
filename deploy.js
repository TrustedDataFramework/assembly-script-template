const child_process = require('child_process');
const conf = require(process.env['CONFIG'] ? process.env['CONFIG'] : './deploy-config.json');
const tool = require('@salaku/js-sdk')
const sk = conf['private-key']
const pk = tool.privateKey2PublicKey(sk)


function compile() {
    return new Promise((resolve, reject) => {
        child_process.exec(
            conf['asc-path'] + ' ' + conf.source + ' --optimize -b', // 执行的命令
            {encoding: 'buffer'},
            (err, stdout, stderr) => {
                if (err) {
                    // err.code 是进程退出时的 exit code，非 0 都被认为错误
                    // err.signal 是结束进程时发送给它的信号值
                    reject(stderr.toString('ascii'))
                }
                resolve(stdout)
            }
        );
    })
    .catch(console.error)
}


async function main(){
    const o = await compile()
    const tx = {
        version: conf.version,
        type: 2,
        createdAt: Math.floor((new Date()).valueOf() / 1000),
        nonce: conf['nonce'] ? conf['nonce']: 0,
        from: tool.privateKey2PublicKey(sk),
        payload: o.toString('hex')
    }
    if(!tx.nonce){
        tx.nonce = (await tool.getNonce(conf.host, conf.port ? conf.port : 7010, pk)) + 1
    }

    tool.sign(tx, sk)
    console.log(`contract address = ${tool.getContractAddress(pk, tx.nonce)}`)
    const resp = await tool.sendTransaction(conf.host, conf.port, tx)
    console.log(resp)
}

main()


