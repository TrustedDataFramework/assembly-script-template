// @ts-ignore
@external("env", "_transfer")

declare function _transfer(type: u32, arg1: u64, arg2: u64, arg3: u64, arg4: u64, arg5: u64): void;

// transfer from contract address to caller
export function transferBack(amount: u64): void{
    _transfer(0, amount, 0, 0, 0, 0);
}