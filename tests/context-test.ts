import {Context, Hex, JSONBuilder, Decimal, log, Result, JSONReader} from "../lib";


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
    log(Hex.encode(ctx.transactionHash));
    log(Hex.encode(ctx.sender));
    log(Hex.encode(ctx.recipient));
    log(Hex.encode(ctx.parentBlockHash));
    log(ctx.amount.toString());
    log(ctx.gasPrice.toString());
    log(ctx.gasLimit.toString());
    log(ctx.blockTimestamp.toString());
    log(ctx.transactionTimestamp.toString());
    log(ctx.blockHeight.toString());
    log(ctx.method);
}