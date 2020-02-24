import {Context, Hex, JSONBuilder, Decimal, log, Result, JSONReader} from "../lib";

class Counter{
    count: i32
}

let counter: Counter;

// every contract should had a function named by init
// which will be called at most once when contract deployed
export function init(): void{
    counter = new Counter();
    log("contract deployed successfully by index.ts")
}

export function invoke(): void{
    log("hello world");
}


export function incrementAndGet(): i32 {
    counter.count = counter.count + 1;
    log("call contract successful counter = " + counter.count.toString());
    return counter.count;
}
