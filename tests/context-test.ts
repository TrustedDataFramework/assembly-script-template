import {Context, Hex, JSONBuilder, Decimal, log, Result, JSONReader, Contract} from "../lib";


// every contract should had a function named by init
// which will be called at most once when contract deployed
export function init(): void{
    testContext();
}

export function invoke(): void{
    log("hello world");
}



export function testContext(): void{
    let ctx: Context = Context.load();
    assert(ctx.method == 'init');
    assert(Hex.encode(ctx.from) == 'e54090596bcdfe5441e1e3d838cdbf5a8eed6b1fd71d105cc4f59646faadb6da');
    assert(Hex.encode(ctx.to) == '');
    assert(Hex.encode(ctx.transactionHash) != '');
    assert(ctx.gasPrice == 100);
    assert(ctx.transactionTimestamp > 0);
    assert(ctx.blockTimestamp > 0);
    assert(ctx.blockHeight > 0);
    assert(Hex.encode(ctx.parentBlockHash) != '');
    assert(ctx.amount == 0);
    assert(Hex.encode(ctx.signature) == 'ff');
    assert(ctx.nonce == 1);

    const contract = Contract.load();
    assert(contract.address.byteLength == 20);
    assert(Hex.encode(contract.createdBy) == '87b8f0b097b48b282a5c661babc8096e141bd9fb');
}
