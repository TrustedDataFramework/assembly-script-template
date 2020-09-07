import { log, Util, Address, U256, RLP, Context } from "../lib";

// every contract should had a function named by init
// which will be called at most once when contract deployed
export function init(): void {
    const NULL = new Uint8Array(1);
    NULL[0] = 0x80;
    // log(sizeof<bool>().toString());
    // log(sizeof<Bool>().toString());
    // log(nameof<bool>());
    // log(nameof<Bool>());
    log(RLP.decode<bool>(NULL.buffer).toString());
    log(RLP.decode<u8>(NULL.buffer).toString());
    log(RLP.decode<u16>(NULL.buffer).toString());
    log(RLP.decode<u32>(NULL.buffer).toString());
    log(RLP.decode<u64>(NULL.buffer).toString());

}

export function invoke(): void {
    log("hello world");
}
