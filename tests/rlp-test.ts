import {Hex, log, RLP, RLPItem, RLPList} from "../lib";


// every contract should had a function named by init
// which will be called at most once when contract deployed
export function init(): void{
    testRLP();
    log('success ======================================================')
}

export function invoke(): void{

}


export function testRLP():void {
    const a1 = RLP.encodeBytes(Uint8Array.wrap(String.UTF8.encode("cat")));
    // const a2 = RLP.encodeBytes(Uint8Array.wrap(String.UTF8.encode("dog")));
    // const encoded = RLP.encodeElements([a1, a2]);
    // log(Hex.encode(encoded));
}
