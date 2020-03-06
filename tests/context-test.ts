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
    const transaction = Context.transaction();
    const contract = Context.contract();

    log('parenthash = ' + Hex.encode(header.parentHash));
    log('height = ' + header.height.toString());


    log('contract nonce = ' + contract.nonce.toString())
    assert(contract.address.byteLength == 20);
    log('contract created by: ' + Hex.encode(contract.createdBy));
}
