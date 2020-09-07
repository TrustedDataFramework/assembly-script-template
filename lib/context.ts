import { RLPList, RLP } from "./rlp";
import { Util, U256 } from "./util";
import {log} from "./index";

// @ts-ignore
@external("env", "_context")
// type, dst, put ?
declare function _context(type: u64, arg0: u64, arg1: u64, arg2: u64, arg3: u64): u64;

// @ts-ignore
@external("env", "_reflect")
// type, address, method, parameters, dst
// type, binary, parameters, 0, 0, amount , dst
declare function _reflect(type: u64, ptr0: u64, ptr0Len: u64, ptr1: u64, ptr1Len: u64, ptr2: u64, ptr2Len: u64, amount_ptr: u64, amount_len: u64, dst: u64): u64;

// @ts-ignore
@external("env", "_transfer")
// type, address, amount
declare function _transfer(type: u64, ptr0: u64, ptr1Len: u64, amount_ptr: u64, amount_len: u64): void;

// @ts-ignore
@external("env", "_result")
declare function _result(offset: usize, len: usize): void;

// @ts-ignore
@external("env", "_event")
//result z
declare function _event(arg0: u64,
    arg1: u64, arg2: u64,
    arg3: u64, arg4: u64
): u64;

function getBytes(type: u32): ArrayBuffer {
    const len = u32(_context(type, 0, 0, 0, 0));
    const buf = new ArrayBuffer(u32(len));
    _context(type, changetype<usize>(buf), 1, 0, 0);
    return buf;
}

function getU64(type: u32): u64 {
    return _context(type, 0, 0, 0, 0);
}

enum ReflectType {
    CALL_WITHOUT_PUT, // call without put into memory
    CALL_WITH_PUT, // call and put into memory
    CREATE
}

export class Address {

    @operator(">")
    static __op_gt(left: Address, right :Address): bool {
        return Util.compareBytes(left.buf, right.buf) > 0;
    }

    @operator(">=")
    static __op_gte(left: Address, right :Address): bool {
        return Util.compareBytes(left.buf, right.buf) >= 0;
    }

    @operator("<")
    static __op_lt(left: Address, right :Address): bool {
        return Util.compareBytes(left.buf, right.buf) < 0;
    }

    @operator("<=")
    static __op_lte(left: Address, right :Address): bool {
        return Util.compareBytes(left.buf, right.buf) <= 0;
    }

    @operator("==")
    static __op_eq(left: Address, right :Address): bool {
        return Util.compareBytes(left.buf, right.buf) == 0;
    }

    @operator("!=")
    static __op_ne(left: Address, right :Address): bool {
        return Util.compareBytes(left.buf, right.buf) != 0;
    }


    constructor(readonly buf: ArrayBuffer) {
    }

    transfer(amount: U256): void {
        const ptr = changetype<usize>(this.buf);
        _transfer(0, ptr, this.buf.byteLength, changetype<usize>(amount.buf), amount.buf.byteLength);
    }

    call(method: string, parameters: Parameters, amount: U256): Parameters {
        const buf = RLP.encodeElements(parameters.li.elements);
        const ptr0 = changetype<usize>(this.buf);
        const ptr0len = this.buf.byteLength;
        const str = String.UTF8.encode(method);
        const ptr1 = changetype<usize>(str);
        const ptr1len = str.byteLength;
        const ptr2 = changetype<usize>(buf);
        const ptr2len = buf.byteLength;
        const len = _reflect(ReflectType.CALL_WITHOUT_PUT, ptr0, ptr0len, ptr1, ptr1len, ptr2, ptr2len, changetype<usize>(amount.buf), amount.buf.byteLength, 0);
        const ret = new ArrayBuffer(u32(len));
        _reflect(ReflectType.CALL_WITH_PUT, ptr0, ptr0len, ptr1, ptr1len, ptr2, ptr2len, changetype<usize>(amount.buf), amount.buf.byteLength, changetype<usize>(ret));
        return len == 0 ? Parameters.EMPTY : new Parameters(RLPList.fromEncoded(ret));
    }

    balance(): U256 {
        const len = _context(ContextType.ACCOUNT_BALANCE, changetype<usize>(this.buf), this.buf.byteLength, 0, 0);
        const ret = new ArrayBuffer(u32(len));
        _context(ContextType.ACCOUNT_BALANCE, changetype<usize>(this.buf), this.buf.byteLength, changetype<usize>(ret), 1);
        return new U256(ret);
    }

    nonce(): u64 {
        const ptr = changetype<usize>(this.buf);
        return _context(ContextType.ACCOUNT_NONCE, ptr, this.buf.byteLength, 0, 0);
    }

    // get contract code
    code(): ArrayBuffer {
        const ptr = changetype<usize>(this.buf);
        const len = _context(ContextType.CONTRACT_CODE, ptr, this.buf.byteLength, 0, 0);
        const ret = new ArrayBuffer(u32(len));
        _context(ContextType.CONTRACT_CODE, ptr, this.buf.byteLength, changetype<usize>(ret), 1);
        return ret;
    }

    toString(): string{
        return Util.encodeHex(this.buf);
    }
}



enum ContextType {
    HEADER_PARENT_HASH,
    HEADER_CREATED_AT,
    HEADER_HEIGHT,
    TX_TYPE,
    TX_CREATED_AT,
    TX_NONCE,
    TX_ORIGIN,
    TX_GAS_PRICE,
    TX_AMOUNT,
    TX_TO,
    TX_SIGNATURE,
    TX_HASH,
    CONTRACT_ADDRESS,
    CONTRACT_NONCE,
    CONTRACT_CREATED_BY,
    ARGUMENTS_METHOD,
    ARGUMENTS_PARAMETERS,
    ACCOUNT_NONCE,
    ACCOUNT_BALANCE,
    MSG_SENDER,
    MSG_AMOUNT,
    CONTRACT_CODE
}

export enum TransactionType {
    // coinbase transaction has code 0
    COIN_BASE,
    // the amount is transferred from sender to recipient
    // if type is transfer, payload is null
    // and fee is a constant
    TRANSFER,
    // if type is contract deploy, payload is wasm binary module
    // fee = gasPrice * gasUsage
    CONTRACT_DEPLOY,
    // if type is contract call, payload = gasLimit(little endian, 8 bytes) +
    // method name length (an unsigned byte) +
    // method name(ascii string, [_a-zA-Z][_a-zA-Z0-9]*) +
    // custom parameters, could be load by Parameters.load() in contract
    // fee = gasPrice * gasUsage
    // e.g.

    CONTRACT_CALL
}

export class ParametersBuilder {
    private readonly elements: Array<ArrayBuffer>;
    constructor() {
        this.elements = new Array<ArrayBuffer>();
    }

    push<T>(data: T): void{
        this.elements.push(RLP.encode<T>(data));
    }   

    build(): Parameters {
        const encoded = RLP.encodeElements(this.elements);
        return new Parameters(RLPList.fromEncoded(encoded));
    }
}

export class Parameters {
    static EMPTY: Parameters = new Parameters(RLPList.EMPTY);

    constructor(
        readonly li: RLPList
    ) { }

    get<T>(idx: u32): T{
        return RLP.decode<T>(this.li.getRaw(idx));
    }

    // return parameters
    writeResult(): void {
        _result(changetype<usize>(this.li.encoded), this.li.encoded.byteLength);
    }
}

export class Header {
    constructor(
        readonly parentHash: ArrayBuffer,
        readonly createdAt: u64,
        readonly height: u64
    ) { }
}

export class Msg {
    constructor(
        readonly sender: Address,
        readonly amount: U256,
    ) { }
}

export class Transaction {
    constructor(
        readonly type: u32,
        readonly createdAt: u64,
        readonly nonce: u64,
        readonly origin: Address,
        readonly gasPrice: U256,
        readonly amount: U256,
        readonly to: Address,
        readonly signature: ArrayBuffer,
        readonly hash: ArrayBuffer
    ) {
    }
}

export class Contract {
    constructor(
        readonly address: Address,
        readonly nonce: u64,
        readonly createdBy: Address
    ) {
    }
}


/**
 * context.load() is only available when deploy/call contract
 */
export class Context {
    static self(): Address {
        return new Address(getBytes(ContextType.CONTRACT_ADDRESS));
    }

    static emit(name: string, data: Parameters): void {
        const str = String.UTF8.encode(name);
        const buf = data.li.encoded;
        _event(0, changetype<usize>(str), str.byteLength, changetype<usize>(buf), buf.byteLength);
    }



    static header(): Header {
        return new Header(
            getBytes(ContextType.HEADER_PARENT_HASH),
            getU64(ContextType.HEADER_CREATED_AT),
            getU64(ContextType.HEADER_HEIGHT)
        );
    }

    static msg(): Msg {
        return new Msg(
            new Address(getBytes(ContextType.MSG_SENDER)),
            new U256(getBytes(ContextType.MSG_AMOUNT))
        );
    }

    static transaction(): Transaction {
        return new Transaction(
            u8(getU64(ContextType.TX_TYPE)),
            getU64(ContextType.TX_CREATED_AT),
            getU64(ContextType.TX_NONCE),
            new Address(getBytes(ContextType.TX_ORIGIN)),
            new U256(getBytes(ContextType.TX_GAS_PRICE)),
            new U256(getBytes(ContextType.TX_AMOUNT)),
            new Address(getBytes(ContextType.TX_TO)),
            getBytes(ContextType.TX_SIGNATURE),
            getBytes(ContextType.TX_HASH),
        );
    }

    static contract(): Contract {
        return new Contract(
            new Address(getBytes(ContextType.CONTRACT_ADDRESS)),
            getU64(ContextType.CONTRACT_NONCE),
            new Address(getBytes(ContextType.CONTRACT_CREATED_BY))
        );
    }

    static parameters(): Parameters {
        const buf = getBytes(ContextType.ARGUMENTS_PARAMETERS);
        const li = RLPList.fromEncoded(buf);
        return new Parameters(li);
    }

    static create(code: ArrayBuffer, parameters: Parameters, amount: U256): Address {
        const ptr0 = changetype<usize>(code);
        const ptr0len = code.byteLength;
        const buf = RLP.encodeElements(parameters.li.elements);
        const ptr1 = changetype<usize>(buf);
        const ptr1len = buf.byteLength;

        const ret = new ArrayBuffer(20);
        _reflect(ReflectType.CREATE, ptr0, ptr0len, ptr1, ptr1len, 0, 0, changetype<usize>(amount.buf), amount.buf.byteLength, changetype<usize>(ret));
        return new Address(ret);
    }
}
