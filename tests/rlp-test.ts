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
    assert(Hex.encode(RLP.encodeU64(65536)) == '83010000');
    assert(Hex.encode(RLP.encodeU64(0x7fffffff)) == '847fffffff');
    assert(Hex.encode(RLP.encodeU64(u64.MAX_VALUE)) == '88ffffffffffffffff');
    assert(Hex.encode(RLP.encodeString('EthereumJ Client')) == '90457468657265756d4a20436c69656e74');

}

export function testDecode():void {
    const arr: Array<u64> = [255, 0, 30303, 20202, 65536, 0x7fffffff, u32.MAX_VALUE, u64.MAX_VALUE, i32.MAX_VALUE, i64.MAX_VALUE];
    for (let i = 0; i < arr.length; i++) {
        const el = arr[i];
        assert(RLPItem.fromEncoded(RLP.encodeU64(el)).u64() == el);
    }
}
