
// every contract should had a function named by init

import { Util, U256, Address, log, ___idof, ABI_DATA_TYPE, Context} from "../lib";

// which will be called at most once when contract deployed
export function init(): Address {
    log(Util.encodeHex(Context.self().abi()));
    Context.emit<Event>(new Event(Context.self(), 'hello world', false, 222222, 3.14, i64.MIN_VALUE));
    return Context.self();
}



export function getBool(a: bool): bool {
    log(a.toString());
    return a;
}

export function getI64(x: i64): i64 {
    log(x.toString());
    return x;
}

export function getU64(x: u64): u64 {
    log(x.toString());
    return x;
}

export function getString(x: string): string {
    log(x);
    return x;
}

export function getBytes(x: ArrayBuffer): ArrayBuffer {
    log(Util.encodeHex(x));
    return x;
}

export function getAddress(x: Address): Address {
    log(x.toString());
    return x;
}

export function getF64(x: f64): f64 {
    log(x.toString());
    return x;
}

export function getU256(x: U256): U256 {
    log(x.toString());
    return x;
}

export function __idof(type: ABI_DATA_TYPE): u32{
    return ___idof(type);
}

@unmanaged
class Event{
    constructor(readonly addr: Address, readonly msg: string, readonly amount0: bool, readonly amount1: u64, readonly amount2: f64, readonly amount3: i64){
    }
}