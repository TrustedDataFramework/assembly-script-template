import {Decimal, log} from "../lib";

// every contract should had a function named by init
// which will be called at most once when contract deployed
export function init(): void{
    test();
    log("success")
}

export function invoke(): void{
    log("hello world");
}


export function test():void {
    assert(Decimal.add("1.1", "0.1") == '1.2','0');
    assert(parseInt(Decimal.sub("1.1", "0.1")) == 1,'1');
    assert(Decimal.mul("0.5", "0.5") == '0.25','1');
    log(Decimal.div("1", "2", 1));
    assert(Decimal.div("1", "2", 1) == '0.5','1');
}
