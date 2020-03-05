import {Hex, log, RLP, RLPItem, RLPList} from "../lib";


// every contract should had a function named by init
// which will be called at most once when contract deployed
export function init(): void{
    testEncode();
    testDecode();
    log('success ======================================================')
}

export function invoke(): void{

}


export function testEncode():void {
    let encoded = RLP.encodeStringArray(['cat', 'dog']);
    assert(Hex.encode(encoded) == 'c88363617483646f67');
    encoded = RLP.encodeStringArray(["dog", "god", "cat"]);
    assert(Hex.encode(encoded) ==  "cc83646f6783676f6483636174");
    assert(Hex.encode(RLP.encodeBytes(new Uint8Array(0))) == '80');

    // test byte array

    let arr = new Uint8Array(1);
    arr[0] = 120;
    encoded = RLP.encodeBytes(arr);
    assert(Hex.encode(encoded) == '78');

    arr[0] = 127;
    encoded = RLP.encodeBytes(arr);
    assert(Hex.encode(encoded) == '7f');

    assert(Hex.encode(RLP.encodeU64(0)) == '80');
    assert(Hex.encode(RLP.encodeU64(30303)) == '82765f');
    assert(Hex.encode(RLP.encodeU64(20202)) == '824eea');
}

export function testDecode():void {
    assert(RLPItem.fromEncoded(RLP.encodeU64(255)).u64() == 255);
}
