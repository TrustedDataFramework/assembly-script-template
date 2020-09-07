/**
 * 智能合约部署示例
 */
const tool = require('@salaku/js-sdk')

// 读取配置
const sk = 'b01bb4ceb384ceee3b1eaf2ed78deba989ed92b25c75f28de58fa8bba191d7bc'
const pk = tool.privateKey2PublicKey(sk)
const addr = tool.publicKey2Address(pk)

const contract = new tool.Contract('', require('./local/coin.abi.json'))

// 事务构造工具
const builder = new tool.TransactionBuilder(tool.constants.POA_VERSION, sk, 0, 200000)

// rpc 工具
const rpc = new tool.RPC('localhost', 7010)
const ascPath = 'node_modules/.bin/asc';

// 两个代币的地址

async function main() {
    // 编译合约得到二进制内容
    contract.binary = await tool.compileContract(ascPath, 'assembly/index.ts', { debug: true })
    builder.nonce = parseInt(await rpc.getNonce(addr)) + 1
    const tx = builder.buildDeploy(contract, {
        tokenName: 'doge',
        symbol: 'DOGE',
        totalSupply: '90000000000000000',
        decimals: 8,
        owner: addr
    })
    return rpc.sendAndObserve(tx)
}

main()
    .then(() => rpc.close())
    .catch(e => {
        console.error(e);
        rpc.close();
    })

// test()