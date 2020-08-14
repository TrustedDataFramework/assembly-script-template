import { log } from "../lib";

// every contract should had a function named by init
// which will be called at most once when contract deployed
export function init(): void {
    log("contract deployed successfully by index.ts")
}

export function invoke(): void {
    log("hello world");
}
