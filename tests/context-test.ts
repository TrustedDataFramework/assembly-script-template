import {Context, Hex, log} from "../lib";


// every contract should had a function named by init
// which will be called at most once when contract deployed
export function init(): void{
    testContext();
    log('success + ===============')
}

export function invoke(): void{
    testContext();
    log('invoked');
}



export function testContext(): void{
    const header = Context.header();


    log('parenthash = ' + Hex.encode(header.parentHash));
    log('height = ' + header.height.toString());

}
