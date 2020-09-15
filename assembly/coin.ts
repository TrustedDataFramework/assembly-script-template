/**
 * erc 20 example in assembly script
 */

import { Util, U256, Globals, ABI_DATA_TYPE, ___idof } from '../lib'
import { Store } from '../lib'
import { Context, Address } from '../lib'

const _balance = Store.from<Address, U256>('balance');
const _freeze = Store.from<Address, U256>('freeze');

export function init(tokenName: string, symbol: string, totalSupply: U256, decimals: u64, owner: Address): Address {
    // tokenName || symbol || totalSupply || decimals || owner
    Globals.set<string>('tokenName', tokenName);
    Globals.set<string>('symbol', symbol);
    Globals.set<U256>('totalSupply', totalSupply);
    Globals.set<u64>('decimals', decimals);
    Globals.set<Address>('owner', owner);
    _balance.set(owner, totalSupply);
    return Context.self();
}

// display balance
export function balanceOf(addr: Address): U256 {
    return _balance.getOrDefault(addr, U256.ZERO);
}

export function freezeOf(addr: Address): U256 {
    return _freeze.getOrDefault(addr, U256.ZERO);
}

export function tokenName(): string {
    return Globals.get<string>('tokenName');
}

export function symbol(): string {
    return Globals.get<string>('symbol');
}

export function decimals(): u64 {
    return Globals.get<u64>('decimals');
}

export function totalSupply(): U256 {
    return Globals.get<U256>('totalSupply');
}

export function owner(): Address {
    return Globals.get<Address>('owner');
}

/* Send coins */
export function transfer(to: Address, amount: U256): void {
    const msg = Context.msg();
    assert(amount > U256.ZERO, 'amount is not positive');
    let b = balanceOf(msg.sender)
    assert(b >= amount, 'balance is not enough');
    _balance.set(to, balanceOf(to) + amount);
    _balance.set(msg.sender, balanceOf(msg.sender) - amount);
    Context.emit<Transfer>(new Transfer(msg.sender, to, amount));
}

// 冻结
export function freeze(amount: U256): void {
    const msg = Context.msg();
    assert(balanceOf(msg.sender) >= amount, 'balance is not enough');
    _balance.set(msg.sender, balanceOf(msg.sender) - amount);
    _freeze.set(msg.sender, freezeOf(msg.sender) + amount);
    Context.emit<Freeze>(new Freeze(msg.sender, amount));
}

// 解冻
export function unfreeze(amount: U256): void {
    const msg = Context.msg();
    assert(freezeOf(msg.sender) >= amount, 'freeze is not enough');
    _freeze.set(msg.sender, freezeOf(msg.sender) - amount);
    _balance.set(msg.sender, balanceOf(msg.sender) + amount);
    Context.emit<Unfreeze>(new Unfreeze(msg.sender, amount));
}

/* Allow another contract to spend some tokens in your behalf */
export function approve(to: Address, amount: U256): void {
    const msg = Context.msg();
    assert(amount > U256.ZERO, 'amount is not positive');
    _setAllowanceOf(msg.sender, to, amount);
    Context.emit<Approve>(new Approve(msg.sender, to, amount));
}

export function allowanceOf(from: Address, sender: Address): U256 {
    const db = getAllowanceDB(from);
    return db.getOrDefault(sender, U256.ZERO);
}

/* A contract attempts to get the coins */
export function transferFrom(from: Address, to: Address, amount: U256): void {
    const msg = Context.msg();
    assert(amount > U256.ZERO, 'amount is not positive');
    const allowance = allowanceOf(from, msg.sender);
    const balance = balanceOf(from);
    assert(balance >= amount, 'balance is not enough');
    assert(allowance >= amount, 'allowance is not enough');
    _setAllowanceOf(from, msg.sender, allowanceOf(from, msg.sender) - amount);
    _balance.set(from, balanceOf(from) - amount);
    _balance.set(to, balanceOf(to) + amount);
    Context.emit<Transfer>(new Transfer(from, to, amount));
}

// 许可金
function getAllowanceDB(addr: Address): Store<Address, U256> {
    const prefix = Util.concatBytes(Util.str2bin('allowance'), addr.buf);
    return new Store<Address, U256>(prefix);
}


function _setAllowanceOf(from: Address, msgSender: Address, amount: U256): void {
    const db = getAllowanceDB(from);
    db.set(msgSender, amount);
}


export function __idof(type: ABI_DATA_TYPE): u32 {
    return ___idof(type);
}

@unmanaged
class Approve {
    constructor(
        readonly from: Address,
        readonly sender: Address,
        readonly amount: U256) {
    }
}

@unmanaged class Transfer {
    constructor(readonly from: Address, readonly to: Address, readonly value: U256) { }
}

@unmanaged class Freeze {
    constructor(readonly from: Address, readonly value: U256) { }
}

@unmanaged class Unfreeze {
    constructor(readonly from: Address, readonly value: U256) { }
}
