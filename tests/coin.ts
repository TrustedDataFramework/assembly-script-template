import {Context, log, Parameters, Result, JSONBuilder, Hex, JSONReader, Contract} from "../lib";


let balances: Map<string, u64>;

export function init(): void {
    balances = new Map<string, u64>();
    let contract = Contract.load();
    balances.set(Hex.encode(contract.createdBy), 100_0000);
    log("contract deployed successfully address = " + Hex.encode(Contract.load().address));
}

/**
 * 充值
 */
export function charge(): void{
    const c = Context.load();
    const p = Parameters.load();
    assert(p.readAll().byteLength == 0, 'parameters are not allowed in charge');
    if(!balances.has(Hex.encode(c.from))){
        balances.set(Hex.encode(c.from), 0);
    }
    balances.set(Hex.encode(c.from), balances.get(Hex.encode(c.from)) + c.amount);
    log('charge to address ' + Hex.encode(c.from) + " success, balance = " + balances.get(Hex.encode(c.from)).toString() + " after charge");
}

/**
 * 转账
 */
export function transfer(): void {
    const c = Context.load();
    const p = Parameters.load();

    if(!balances.has(Hex.encode(c.from))){
        balances.set(Hex.encode(c.from), 0);
    }

    if(!balances.has(Hex.encode(c.to))){
        balances.set(Hex.encode(c.to), 0);
    }

    let balance = balances.get(Hex.encode(c.from));
    let json = String.UTF8.decode(p.readAll().buffer);
    let to = JSONReader.getStringByKey(json, 'to');
    let amount = JSONReader.getU64ByKey(json, 'amount');

    assert(c.amount == 0, 'the amount in transaction will be transfer to creator');
    assert(balance >= amount, 'balance is not enough');

    balance -= amount;
    balances.set(Hex.encode(c.from), balance);
    balances.set(to, balances.get(to) + amount)

    log("transfer succeed, balance is " + balance.toString())
}

/**
 * 查看余额
 */
export function getBalance(): void {
    const p = Parameters.load();
    assert(p.method == 'getBalance', 'method name is equal');

    let json = String.UTF8.decode(p.readAll().buffer);
    let address = JSONReader.getStringByKey(json, 'address');

    if(!balances.has(address)){
        balances.set(address, 0);
    }
    let balance = balances.get(address);
    log("getBalance succeed, balance is " + balance.toString());

    JSONBuilder.putString('address', address);
    JSONBuilder.putU64("balance", balance);
    Result.write(Uint8Array.wrap(String.UTF8.encode(JSONBuilder.build())));
}
