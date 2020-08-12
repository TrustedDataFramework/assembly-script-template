// @ts-ignore
@external("env", "_event")
//result z
declare function _event(arg0: u64,
                          arg1: u64, arg2: u64,
                          arg3: u64, arg4: u64
): u64;

export class Event{
    static emit(name: string, data: Uint8Array): void{
        const n = String.UTF8.encode(name);
        _event(0, changetype<usize>(n), n.byteLength, changetype<usize>(data), data.byteLength);
    }
}
