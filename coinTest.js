/**
 * 智能合约部署示例
 */
const tool = require('@salaku/js-sdk')
const fs = require('fs')

// 私钥
const sk = 'b01bb4ceb384ceee3b1eaf2ed78deba989ed92b25c75f28de58fa8bba191d7bc'
// 地址1
const addr = tool.publicKey2Address(tool.privateKey2PublicKey(sk))
// 地址2
const recipient = '54e670985631117904d10341676a57d11687bbc5'

// rpc 工具
const rpc = new tool.RPC('localhost', 7010)
const ascPath = 'node_modules/.bin/asc';

const builder = new tool.TransactionBuilder(tool.constants.POA_VERSION, sk, /* gas limit */0, /* gas price */ 200000)
const log = (o) => console.dir(o, { depth: null })

async function deployCoin() {
    const contract = new tool.Contract()
    // 编译合约得到字节码
    contract.binary = await tool.compileContract(ascPath, 'assembly/coin.ts')
    // 得到 abi
    contract.abi = tool.compileABI(fs.readFileSync('assembly/coin.ts'))
    // 写入 abi
    fs.writeFileSync('assembly/coin.abi.json', JSON.stringify(contract.abi))
    // 获取 nonce 
    builder.nonce = (await rpc.getNonce(addr)) + 1

    // 发币
    let tx = builder.buildDeploy(contract, {
        tokenName: 'doge',
        symbol: 'DOGE',
        totalSupply: '90000000000000000',
        decimals: 8,
        owner: addr
    }, 0)

    // 预先计算好合约的地址
    contract.address = tool.getContractAddress(addr, tx.nonce)

    // 监听转账事件
    rpc.listenOnce(contract, 'Transfer').then((data) => { console.log('event = Transfer'); log(data); })
    // 监听冻结事件
    rpc.listen(contract, 'Freeze', (data) => { console.log('event = Freeze'); log(data); })
    // 监听解冻事件
    rpc.listen(contract, 'Unfreeze').then((data) => { console.log('event = Unfreeze'); log(data); })



    // 部署合约
    log(await rpc.sendAndObserve(tx))

    // 发送转账 发一个币给 recipient
    tx = builder.buildContractCall(contract, 'transfer', {
        to: recipient,
        amount: 100000000
    })
    log(await rpc.sendAndObserve(tx))

    // 冻结一个币
    tx = builder.buildContractCall(contract, 'freeze', {
        amount: 100000000
    })
    log(await rpc.sendAndObserve(tx))

    // 解冻一个币
    tx = builder.buildContractCall(contract, 'unfreeze', {
        amount: 100000000
    })
    log(await rpc.sendAndObserve(tx))

    // 查看 recipient 的余额
    log(await rpc.viewContract(contract, 'balanceOf', recipient))

    log(rpc.__txObservers.size)
    log(rpc.__eventHandlers.size)
}

deployCoin().catch(console.error)
