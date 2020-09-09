import {___idof, ABI_DATA_TYPE, Address, Context, ParametersBuilder, U256, log, Parameters} from "../lib";

export function init(idx: Address): void{
    const code = idx.code();
    const idx2 = Context.create(code, Parameters.EMPTY, U256.ZERO);
    const builder = new ParametersBuilder();
    builder.push<U256>(U256.fromU64(123));
    log(idx2.call<U256>('getU256', builder.build(), U256.ZERO).toString());
}

export function __idof(type: ABI_DATA_TYPE): u32{
    return ___idof(type);
}