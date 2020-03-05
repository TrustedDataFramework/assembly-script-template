import {DB, DBIterator, log, RLP} from "../lib";
import {assert} from "builtins";


export function init(): void{
    test();
    log('success ===================')
}

export function invoke(): void{
    assert(DB.has(RLP.encodeString('key')));
    const v = RLP.decodeString(DB.get(RLP.encodeString('key')));
    assert(v == 'value')
    log('success ======');
}


export function test():void {
    DB.set(RLP.encodeString('key'), RLP.encodeString('value'));
}
