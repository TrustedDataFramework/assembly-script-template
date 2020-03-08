/*
代币合约样例, 本案例通过 json 传参，生产环境应尽量使用二进制格式传参
 */
import {Context, DB, Hex, JSONBuilder, JSONReader, log, Result, RLP} from "../lib";

export function init(): void {
    const contract = Context.contract();
    DB.set(contract.createdBy, RLP.encodeU64(100_0000));
    log("contract deployed successfully address = " + Hex.encode(contract.address));
}

/**
 * 充值
 */
export function charge(): void{
    const t = Context.transaction();
    assert(t.parameters.length == 0, 'parameters are not allowed in charge');
    let balance: u64 = 0;
    if(DB.has(t.from)){
        balance = RLP.decodeU64(DB.get(t.from));
    }
    balance += t.amount;
    DB.set(t.from, RLP.encodeU64(balance));
    log('charge to address ' + Hex.encode(t.from) + " success, balance = " + balance.toString() + " after charge");
}

/**
 * 转账
 */
export function transfer(): void {
    const t = Context.transaction();
    const p = t.parameters;
    let fromBalance = DB.has(t.from) ? RLP.decodeU64(DB.get(t.from)) : 0;
    let json = String.UTF8.decode(p.buffer);

    let to = Hex.decode(JSONReader.getStringByKey(json, 'to'));
    let toBalance = DB.has(to) ? RLP.decodeU64(DB.get(to)) : 0;


    let amount = JSONReader.getU64ByKey(json, 'amount');

    log('from = ' + Hex.encode(t.from));
    assert(t.amount == 0, 'the amount ' + t.amount.toString() + ' in transaction will be transfer to creator');
    assert(fromBalance >= amount, 'balance  ' + fromBalance.toString() +' is not enough');

    fromBalance -= amount;
    toBalance += amount;
    DB.set(t.from, RLP.encodeU64(fromBalance));
    DB.set(to, RLP.encodeU64(toBalance));

    log("transfer succeed, balance is " + toBalance.toString());
}

/**
 * 查看余额
 */
export function getBalance(): void {
    const args = Context.args();
    assert(args.method == 'getBalance', 'method name is equal');

    let json = String.UTF8.decode(args.parameters.buffer);
    let address = Hex.decode(JSONReader.getStringByKey(json, 'address'));

    let balance = DB.has(address) ? RLP.decodeU64(DB.get(address)) : 0;
    log("getBalance succeed, balance is " + balance.toString());

    JSONBuilder.putString('address', Hex.encode(address));
    JSONBuilder.putU64("balance", balance);
    Result.write(Uint8Array.wrap(String.UTF8.encode(JSONBuilder.build())));
}

/**
 * 提取，提取并不会主动调用转账，而是以事件的形式通知合约的部署者提取的金额数量，
 * 部署者收到事件后确认事务已被打包，进行转账操作
 */
// export function extract(): void{
//     const p = Parameters.load();
//     const c = Context.load();
//
//     let json = String.UTF8.decode(p.readAll().buffer);
//     let address = Hex.encode(c.from);
//
//     let amount = JSONReader.getU64ByKey(json, 'amount');
//     let balance = balances.has(address) ? balances.get(address) : 0;
//
//     assert(balance >= amount, 'balance is not enough');
//
//     balances.set(address, balance - amount);
//     JSONBuilder.putString('address', address);
//     JSONBuilder.putU64('amount', amount);
//     JSONBuilder.putString('tx', Hex.encode(c.transactionHash));
//     Event.emit('extract', Uint8Array.wrap(String.UTF8.encode(JSONBuilder.build())));
// }
