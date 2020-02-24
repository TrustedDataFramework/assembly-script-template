import {Context, Hex, JSONBuilder, Decimal, log, Result, JSONReader} from "../lib";


// every contract should had a function named by init
// which will be called at most once when contract deployed
export function init(): void{
    testJSON();
    log("success")
}

export function invoke(): void{
    log("hello world");

}


export function testJSON():void {
    JSONBuilder.putJSON("key","{\"name\":\"kitty\"}");
    let json = JSONBuilder.build();
    json = JSONReader.getJSONByKey(json, "key");
    json = JSONReader.getJSONByKey(json, "name");
    assert(json === 'kitty');

    JSONBuilder.putString("key","value");
    json = JSONBuilder.build();
    assert('value' === JSONReader.getStringByKey(json, 'key'));

    JSONBuilder.putU64("abc", u64.MAX_VALUE);
    json = JSONBuilder.build();
    assert(u64.MAX_VALUE === JSONReader.getU64ByKey('abc', json));

    JSONBuilder.putI64("abc", i64.MAX_VALUE);
    json = JSONBuilder.build();
    assert(i64.MAX_VALUE === JSONReader.getI64ByKey(json, 'abc'));

    JSONBuilder.putI64("abc", i64.MIN_VALUE);
    json = JSONBuilder.build();
    assert(i64.MIN_VALUE === JSONReader.getI64ByKey(json, 'abc'));

    JSONBuilder.putBool("abc", true);
    json = JSONBuilder.build();
    assert(JSONReader.getBoolByKey(json, 'abc'))

    JSONBuilder.putF64("abc", f64.MAX_SAFE_INTEGER);
    json = JSONBuilder.build();
    assert(f64.MAX_SAFE_INTEGER === JSONReader.getF64ByKey(json, 'abc'));

    JSONBuilder.putF64("abc", 0.3);
    json = JSONBuilder.build();
    assert(0.3 === JSONReader.getF64ByKey(json, 'abc'));


    JSONBuilder.setBool(0, true);
    JSONBuilder.setString(1, "abc");
    JSONBuilder.setI64(2, i64.MAX_VALUE);
    JSONBuilder.setI64(3, i64.MIN_VALUE);
    JSONBuilder.setU64(4, 0);
    JSONBuilder.setU64(5, u64.MAX_VALUE);
    JSONBuilder.putJSON("key--ddd", JSONBuilder.build());

    json = JSONBuilder.build();
    let arr = JSONReader.getJSONByKey(json, 'key--ddd');
    assert(JSONReader.getBoolByIndex(arr, 0));
    assert(JSONReader.getStringByIndex(arr, 1) === 'abc');
    assert(JSONReader.getI64ByIndex(arr, 2) === i64.MAX_VALUE);
    assert(JSONReader.getI64ByIndex(arr, 3) === i64.MIN_VALUE);
    assert(JSONReader.getU64ByIndex(arr, 4) === 0);
    assert(JSONReader.getU64ByIndex(arr, 5) === u64.MAX_VALUE);

    json = `{"key--ddd":[true,"abc",9223372036854775807,-9223372036854775808,18446744073709551615,0,-1, 0.02]}`;
    arr = JSONReader.getJSONByKey(json, "key--ddd");
    assert(JSONReader.getBoolByIndex(
        arr,
        0
    ));

    assert(JSONReader.getStringByIndex(arr, 1) === 'abc');
    assert(JSONReader.getI64ByIndex(arr, 2).toString() === '9223372036854775807');
    assert(JSONReader.getI64ByIndex(arr, 3).toString() === '-9223372036854775808');
    assert(JSONReader.getU64ByIndex(arr, 4).toString() === '18446744073709551615');
    assert (JSONReader.getF64ByIndex(
        arr,
        7
    ) === 0.02);
}
