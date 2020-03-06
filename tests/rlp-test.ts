import {Hex, log, RLP, RLPItem, RLPList} from "../lib";


// every contract should had a function named by init
// which will be called at most once when contract deployed
export function init(): void {
    testEncode();
    testDecode();
    testEncode_ED();
    testEncodeInt_80();
    testEncodeInt_7f();
    encodeEdgeShortList();
    testEncodeShortString();
    testEncodeEmptyString();
    testEncodeBytesOne();
    testEncodeBytesZero();
    test8();
    test7();
    testMaxNumerics();
    test4();
    log('success ======================================================')
}

export function invoke(): void {

}


export function testEncode(): void {
    let encoded = RLP.encodeStringArray(['cat', 'dog']);
    assert(Hex.encode(encoded) == 'c88363617483646f67');
    encoded = RLP.encodeStringArray(["dog", "god", "cat"]);
    assert(Hex.encode(encoded) == "cc83646f6783676f6483636174");
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

export function testDecode(): void {
    const arr: Array<u64> = [255, 0, 30303, 20202, 65536, 0x7fffffff, u32.MAX_VALUE, u64.MAX_VALUE, i32.MAX_VALUE, i64.MAX_VALUE];
    for (let i = 0; i < arr.length; i++) {
        const el = arr[i];
        assert(RLPItem.fromEncoded(RLP.encodeU64(el)).u64() == el, el.toString() + ' ' + RLPItem.fromEncoded(RLP.encodeU64(el)).u64().toString());
    }
}

export function testEncode_ED(): void {
    let result = Hex.encode(RLP.encodeU64(0xED));
    assert(result == "81ed");
    assert(RLPItem.fromEncoded(RLP.encodeU64(0xED)).u64() == 0xED);
}

export function testEncodeInt_80(): void {
    let result = Hex.encode(RLP.encodeU64(0x80));
    assert(result == "8180");
    assert(RLPItem.fromEncoded(RLP.encodeU64(0x80)).u64() == 0x80);
}

export function testEncodeInt_7f(): void {
    let result = Hex.encode(RLP.encodeU64(<u8>0x7f));
    assert(result == "7f");
    // assert(RLPItem.fromEncoded(RLP.encodeU64(<u8>0x7f)).u64() == <u8>0x7f);
}

export function encodeEdgeShortList(): void {
    let expectedOutput = "f7c0c0b4600160003556601359506301000000600035040f6018590060005660805460016080530160005760003560805760203560003557";
    let rlpKeysList = Hex.decode("c0");
    let rlpValuesList = Hex.decode("c0");
    let rlpCode = Hex.decode("b4600160003556601359506301000000600035040f6018590060005660805460016080530160005760003560805760203560003557");
    let arrays = [rlpKeysList, rlpValuesList, rlpCode];
    assert(Hex.encode(RLP.encodeElements(arrays)) == expectedOutput);
    assert(RLPItem.fromEncoded(RLP.encodeString(expectedOutput)).string() == expectedOutput);
}

export function testEncodeShortString(): void {
    let test = "dog";
    let expected = "83646f67";
    assert(Hex.encode(RLP.encodeString(test)) == expected);
    assert(RLPItem.fromEncoded(Hex.decode(expected)).string() == test);
}

export function testEncodeEmptyString(): void {
    let test = "";
    let expected = "80";
    assert(Hex.encode(RLP.encodeString(test)) == expected);
    assert(RLPItem.fromEncoded(Hex.decode(expected)).string() == test);
}

export function testEncodeBytesOne(): void {
    let array = new Uint8Array(1);
    array[0] = 0x01;
    let actual = RLP.encodeBytes(array);
    assert(Hex.encode(actual) == "01");
}

export function testEncodeBytesZero(): void {
    let array = new Uint8Array(1);
    array[0] = 0x00;
    let actual = RLP.encodeBytes(array);
    assert(Hex.encode(actual) == "00");
}

export function test8(): void {
    let byteArr = "ce73660a06626c1b3fda7b18ef7ba3ce17b6bf604f9541d3c6c654b7ae88b23940" +
        "7f659c78f419025d785727ed017b6add21952d7e12007373e321dbc31824ba";
    let byteArray = Hex.decode(byteArr);
    let expected = "b840" + byteArr;
    assert(expected == Hex.encode(RLP.encodeBytes(byteArray)));
}

export function test7(): void {
    // let data = RLP.encodeString("");
    // assert(Hex.encode(data) == "80");
    // let expected = [
    //     0x90, 0x45, 0x74, 0x68, 0x65, 0x72, 0x65,
    //     0x75, 0x6D, 0x4A, 0x20, 0x43, 0x6C,
    //     0x69, 0x65, 0x6E, 0x74
    // ];
    // let uint8 = new Uint8Array(expected.length);
    // let test = "EthereumJ Client";
    // let a = new Uint8Array(expected);
    // assert(Hex.encode(RLP.encodeString(test)) == Hex.encode(expected));
}

export function testMaxNumerics():void {
    let expected1 = u32.MAX_VALUE;
    assert(expected1 == RLPItem.fromEncoded(RLP.encodeU64(expected1)).u32());
    let expected2 = u16.MAX_VALUE;
    assert(expected2 == RLPItem.fromEncoded(RLP.encodeU64(expected2)).u16());
    let expected3 = u64.MAX_VALUE;
    assert(expected3 == RLPItem.fromEncoded(RLP.encodeU64(expected3)).u64());
}

export function test4():void {
    let data = new Uint8Array(1);
    data[0] = 0;
    assert(Hex.encode(RLP.encodeBytes(data)) == "00");
    let data2 = new Uint8Array(1);
    data2[0] = 120;
    assert(Hex.encode(RLP.encodeBytes(data2)) == "78");
    let data3 = new Uint8Array(1);
    data3[0] = 127;
    assert(Hex.encode(RLP.encodeBytes(data3)) == "7f");
}
