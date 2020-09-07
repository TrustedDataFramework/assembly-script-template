import { log, Util, Address, U256, RLP, Context } from "../lib";

// every contract should had a function named by init
// which will be called at most once when contract deployed
export function init(): void {
    log(Util.encodeHex(RLP.encode<bool>(true)));
}

export function invoke(): void {
    log("hello world");
}
