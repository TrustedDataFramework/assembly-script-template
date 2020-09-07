import {DB, log, RLP, Context, ParametersBuilder} from "../lib";

const KEY = Uint8Array.wrap(String.UTF8.encode('key'));

// every contract should had a function named by init
// which will be called at most once when contract deployed
export function init(): void{
    log("contract deployed successfully by index.ts")
}

export function invoke(): void{

}


export function increment(): void {
    let i = DB.getGlobalOrDefault<u64>('i', 0);
    i++;
    log("call contract successful counter = " + i.toString());
    DB.setGlobal<u64>('i', i);
}

export function get(): void{
    const builder = new ParametersBuilder();
    builder.push<u64>(i);
    builder.build().writeResult();
}

export function getN(): void{
    let i = DB.has(KEY) ?  RLP.decodeU64(DB.get(KEY)) : 0;
    const parameters = Context.parameters();
    const ret = i + parameters.get<u64>(0);

    const builder = new ParametersBuilder();
    builder.push<u64>(ret);
    builder.build().writeResult();
}
