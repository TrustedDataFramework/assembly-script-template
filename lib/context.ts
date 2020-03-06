import {RLPList} from "./rlp";
import {Hash} from "./hash";

// @ts-ignore
@external("env", "_context")
declare function _context(dst: usize, arg1: u64): u64;

export enum TransactionType{
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

export class Header{
    constructor(
        readonly parentHash: Uint8Array,
        readonly createdAt: u64,
        readonly height: u64
    ) {}
}


export class Transaction{
    readonly method: string;
    readonly parameters: Uint8Array;
    readonly from: Uint8Array;
    constructor(
        readonly type: u32,
        readonly createdAt: u64,
        readonly nonce: u64,
        from: Uint8Array,
        readonly gasPrice: u64,
        readonly amount: u64,
        readonly payload: Uint8Array,
        readonly to: Uint8Array,
        readonly signature: Uint8Array,
        readonly hash: Uint8Array
    ) {
        assert(type == TransactionType.CONTRACT_DEPLOY || type == TransactionType.CONTRACT_CALL, 'context not allowed here');
        this.method = type == TransactionType.CONTRACT_DEPLOY ? 'init' : this.methodFromPayload(payload);
        this.parameters = type == TransactionType.CONTRACT_DEPLOY ? new Uint8Array(0) : this.parametersFromPayload(payload);
        const digest = Hash.sm3(from);
        this.from = digest.slice(digest.length - 20, digest.length);
    }

    private methodFromPayload(payload: Uint8Array): string{
        const len = payload[0];
        const buf = payload.slice(1, 1 + len);
        return String.UTF8.decode(buf.buffer);
    }

    private parametersFromPayload(payload: Uint8Array): Uint8Array{
        const len = payload[0];
        return payload.slice(1 + len);
    }
}

export class Contract{
    constructor(
        readonly address: Uint8Array,
        readonly nonce: u64,
        readonly createdBy: Uint8Array
    ) {
    }
}

export class Arguments{
    readonly method: string;
    readonly parameters: Uint8Array;

    constructor(data: Uint8Array) {
        const len = data[0];
        const buf = data.slice(1, 1 + len);
        this.method = String.UTF8.decode(buf.buffer);
        this.parameters = data.slice(1 + len);
    }
}

class RLPListReader{
    private index: u32;
    constructor(readonly li: RLPList) {
    }

    bytes(): Uint8Array{
        const ret = this.li.getItem(this.index).bytes();
        this.index++;
        return ret;
    }

    list(): RLPList{
        const ret = this.li.getList(this.index);
        this.index++;
        return ret;
    }

    reader(): RLPListReader{
        return new RLPListReader(this.list());
    }

    u8(): u8{
        const ret = this.li.getItem(this.index).u8();
        this.index++;
        return ret;
    }

    u64(): u64{
        const ret = this.li.getItem(this.index).u64();
        this.index++;
        return ret;
    }
}

/**
 * context.load() is only available when deploy/call contract
 */
export class Context{
    private static context(): RLPList{
        const len = _context(0, 0);
        const buf = new ArrayBuffer(i32(len));
        _context(changetype<usize>(buf), 1);
        return RLPList.fromEncoded(Uint8Array.wrap(buf));
    }

    static header(): Header{
        const context = Context.context();
        assert(!context.isNull(0), 'header is not available');
        const reader = new RLPListReader(context.getList(0));
        return new Header(reader.bytes(), reader.u64(), reader.u64());
    }

    static transaction(): Transaction{
        const context = Context.context();
        assert(!context.isNull(1), 'transaction is not available');
        const reader = new RLPListReader(context.getList(1));

        return new Transaction(
            reader.u8(),
            reader.u64(),
            reader.u64(),
            reader.bytes(),
            reader.u64(),
            reader.u64(),
            reader.bytes(),
            reader.bytes(),
            reader.bytes(),
            reader.bytes()
        );
    }

    static contract(): Contract{
        const context = Context.context();
        assert(!context.isNull(2), 'contract is not available');
        const reader = new RLPListReader(context.getList(2));
        return new Contract(
            reader.bytes(),
            reader.u64(),
            reader.bytes()
        );
    }

    static args(): Arguments{
        const context = Context.context();
        assert(!context.isNull(3), 'arguments is not available');
        const item = context.getItem(3);
        return new Arguments(
            item.bytes()
        );
    }
}