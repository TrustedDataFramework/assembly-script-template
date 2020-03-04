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
    json = JSONReader.getStringByKey(json, "name");
    assert(json == 'kitty', '1');


    JSONBuilder.putString("key","value");
    json = JSONBuilder.build();
    assert('value' == JSONReader.getStringByKey(json, 'key'), '2');

    JSONBuilder.putU64("abc", u64.MAX_VALUE);
    json = JSONBuilder.build();
    assert(u64.MAX_VALUE == JSONReader.getU64ByKey(json, 'abc'), '3');

    JSONBuilder.putI64("abc", i64.MAX_VALUE);
    json = JSONBuilder.build();
    assert(i64.MAX_VALUE == JSONReader.getI64ByKey(json, 'abc'), '4');

    JSONBuilder.putI64("abc", i64.MIN_VALUE);
    json = JSONBuilder.build();
    assert(i64.MIN_VALUE == JSONReader.getI64ByKey(json, 'abc'), '5');

    JSONBuilder.putBool("abc", true);
    json = JSONBuilder.build();
    assert(JSONReader.getBoolByKey(json, 'abc'), '6');


    JSONBuilder.setBool(0, true);
    JSONBuilder.setString(1, "abc");
    JSONBuilder.setI64(2, i64.MAX_VALUE);
    JSONBuilder.setI64(3, i64.MIN_VALUE);
    JSONBuilder.setU64(4, 0);
    JSONBuilder.setU64(5, u64.MAX_VALUE);
    JSONBuilder.putJSON("key--ddd", JSONBuilder.build());

    json = JSONBuilder.build();
    let arr = JSONReader.getJSONByKey(json, 'key--ddd');
    assert(JSONReader.getBoolByIndex(arr, 0), '9');
    log('10 abc = ' + JSONReader.getStringByIndex(arr, 1));
    log(arr);
    assert(JSONReader.getStringByIndex(arr, 1) == 'abc', '10');
    assert(JSONReader.getI64ByIndex(arr, 2) == i64.MAX_VALUE, '11');
    assert(JSONReader.getI64ByIndex(arr, 3) == i64.MIN_VALUE, '12');
    assert(JSONReader.getU64ByIndex(arr, 4) == 0, '13');
    assert(JSONReader.getU64ByIndex(arr, 5) == u64.MAX_VALUE, '14');

    json = `{"key--ddd":[true,"abc",9223372036854775807,-9223372036854775808,18446744073709551615,0,-1, 0.02]}`;
    arr = JSONReader.getJSONByKey(json, "key--ddd");
    assert(JSONReader.getBoolByIndex(
        arr,
        0
    ), '15');

    assert(JSONReader.getStringByIndex(arr, 1) == 'abc', '16');
    assert(JSONReader.getI64ByIndex(arr, 2).toString() == '9223372036854775807', '17');
    assert(JSONReader.getI64ByIndex(arr, 3).toString() == '-9223372036854775808', '18');
    assert(JSONReader.getU64ByIndex(arr, 4).toString() == '18446744073709551615', '19');


    json = '{"key":"value"}';
    JSONBuilder.setJSON(0, json);
    json = JSONBuilder.build();
    json = JSONReader.getJSONByIndex(json, 0);
    assert(JSONReader.getStringByKey(json, 'key') == 'value');
}
