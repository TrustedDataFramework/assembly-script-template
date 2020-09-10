/**
 * 智能合约部署示例
 */
const tool = require('@salaku/js-sdk')

// 读取配置
const sk = 'b01bb4ceb384ceee3b1eaf2ed78deba989ed92b25c75f28de58fa8bba191d7bc'
const pk = tool.privateKey2PublicKey(sk)
const addr = tool.publicKey2Address(pk)

const contract = new tool.Contract('', require('./assembly/index.abi.json'))

// 事务构造工具
const builder = new tool.TransactionBuilder(tool.constants.POA_VERSION, sk, 0, 200000)

// rpc 工具
const rpc = new tool.RPC('localhost', 7010)
const ascPath = 'node_modules/.bin/asc';

// 两个代币的地址

async function deployIndex() {
    // 编译合约得到二进制内容
    contract.binary = await tool.compileContract(ascPath, 'assembly/index.ts', { debug: true })
    const nonce = parseInt(await rpc.getNonce(addr)) + 1
    builder.nonce = nonce
    const tx = builder.buildDeploy(contract)
    contract.address = tool.getContractAddress(addr, nonce)
    // rpc.listen(contract, 'Event', (params) => { console.log('params=', params) })
    return await rpc.sendAndObserve(tx).then(x => console.dir(x, {depth: null}))
    // await rpc.viewContract(contract, 'getBool', ['true']).then(console.log)
    // await rpc.viewContract(contract, 'getI64', [-1000]).then(console.log)
    // await rpc.viewContract(contract, 'getU64', [2000]).then(console.log)
    // await rpc.viewContract(contract, 'getString', ['hello world']).then(console.log)
    // await rpc.viewContract(contract, 'getBytes', ['ffee']).then(console.log)
    // await rpc.viewContract(contract, 'getAddress', ['2f0119a808c74be8c5e0929e0ab94be211e6f01a']).then(console.log)
    // await rpc.viewContract(contract, 'getU256', ['123456']).then(console.log)
    // await rpc.viewContract(contract, 'getF64', [2.0]).then(console.log)
}

async function deployFactory() {
    // 编译合约得到二进制内容
    contract.binary = await tool.compileContract(ascPath, 'assembly/factory.ts', { debug: true })
    contract.abi = require('./assembly/factory.abi.json')
    const nonce = await rpc.getNonce(addr) + 1
    builder.nonce = nonce
    const tx = builder.buildDeploy(contract, ['da1681b9a25293010a822ee9759e2199217e3aa5'])
    return await rpc.sendAndObserve(tx)
}

async function deployCoin() {
    contract.binary = await tool.compileContract(ascPath, 'local/coin.ts', { debug: true })
    contract.abi = require('./local/coin.abi.json')
    const nonce = await rpc.getNonce(addr) + 1
    builder.nonce = nonce
    // 发第一个币
    let tx = builder.buildDeploy(contract, {
        tokenName: 'doge',
        symbol: 'DOGE',
        totalSupply: '90000000000000000',
        decimals: 8,
        owner: addr
    }, 0)
    contract.address = tool.getContractAddress(addr, nonce)
    await rpc.sendAndObserve(tx)
    const b1 = await rpc.viewContract(contract, 'balanceOf', [contract.address])
    console.log(b1)
    const b2 = await rpc.viewContract(contract, 'balanceOf', [addr])
    console.log(b2)
}

async function transfer(){
    const nonce = await rpc.getNonce(addr) + 1
    builder.nonce = nonce
    const tx = builder.buildTransfer(100000, addr)
    console.log(await rpc.sendAndObserve(tx))
}


// deployIndex()
// .catch(e => console.error((e & e.reason) || e))


// deployFactory().catch(e => console.error( e.reason || e))
//     .then(() => rpc.close())

// deployCoin().catch(e => console.error( e.reason || e))
//     .then(() => rpc.close())

// console.log(tool.bytesToF64(tool.f64ToBytes(2.0)))

transfer().catch(console.error)