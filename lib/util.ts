import {log} from '.'
// @ts-ignore
@external("env", "_util")
// type, address, method, parameters, dst, put?
declare function _util(type: u64, ptr0: u64, ptr0Len: u64, ptr1: u64, ptr1Len: u64, dst: u64, put: u64): u64;

// @ts-ignore
@external("env", "_u256")
// type, a, b, dst, put ? : length
declare function _u256(type: u64, ptr0: u64, ptr0Len: u64, ptr1: u64, ptr1Len: u64, dst: u64, put: u64): u64;


enum UtilType {
    CONCAT_BYTES,
    DECODE_HEX,
    ENCODE_HEX,
    BYTES_TO_U64,
    U64_TO_BYTES
}

enum U256Type {
    PARSE,
    TOSTRING,
    ADD,
    SUB,
    MUL,
    DIV,
    MOD
}

export class U256 {
    static ZERO: U256 = new U256(new ArrayBuffer(0));
    static ONE: U256 = U256.fromU64(1);

    static fromU64(u: u64): U256 {
        const buf = Util.u64ToBytes(u);
        return new U256(buf);
    }

    constructor(readonly buf: ArrayBuffer) {
    }

    private arithmetic(t: U256Type, u: U256): U256 {
        const len = _u256(t, changetype<usize>(this.buf), this.buf.byteLength, changetype<usize>(u.buf), u.buf.byteLength, 0, 0);
        const ret = new ArrayBuffer(u32(len));
        _u256(t, changetype<usize>(this.buf), this.buf.byteLength, changetype<usize>(u.buf), u.buf.byteLength, changetype<usize>(ret), 1);
        return new U256(ret);
    }

    add(u: U256): U256 {
        return this.arithmetic(U256Type.ADD, u);
    }

    safeAdd(u: U256): U256 {
        const c = this.add(u);
        assert(c.compareTo(this) >= 0 && c.compareTo(u) >= 0, "SafeMath: addition overflow");
        return c;
    }

    sub(u: U256): U256 {
        return this.arithmetic(U256Type.SUB, u);
    }

    safeSub(u: U256): U256 {
        assert(u.compareTo(this) <= 0, "SafeMath: subtraction overflow");
        return this.sub(u);
    }

    mul(u: U256): U256 {
        return this.arithmetic(U256Type.MUL, u);
    }

    safeMul(u: U256): U256 {
        if (this.equals(U256.ZERO)) {
            return U256.ZERO;
        }

        const c = this.mul(u);
        if(!c.div(this).equals(u)){
            log(Util.encodeHex(this.buf));
            log(c.toString() + ' mul ' + u.toString() + ' = ' + c.toString())
        }
        assert(c.div(this).compareTo(u) == 0, "SafeMath: multiplication overflow ");
        return c;
    }

    div(u: U256): U256 {
        return this.arithmetic(U256Type.DIV, u);
    }

    safeDiv(u: U256): U256 {
        assert(u.compareTo(U256.ZERO) > 0, "SafeMath: modulo by zero");
        return this.div(u);
    }

    mod(u: U256): U256 {
        return this.arithmetic(U256Type.MOD, u);
    }

    safeMod(u: U256): U256 {
        assert(u.compareTo(U256.ZERO) > 0, "SafeMath: modulo by zero");
        return this.mod(u);
    }

    compareTo(u: U256): i32 {
        return Util.compareBytes(this.buf, u.buf);
    }

    gt(u: U256): bool {
        return this.compareTo(u) > 0;
    }

    gte(u: U256): bool {
        return this.compareTo(u) >= 0;
    }

    lt(u: U256): bool {
        return this.compareTo(u) < 0;
    }

    lte(u: U256): bool {
        return this.compareTo(u) <= 0;
    }

    equals(u: U256): bool{
        return this.compareTo(u) == 0;
    }

    toString(radix: u32 = 10): string {
        const len = _u256(U256Type.TOSTRING, changetype<usize>(this.buf), this.buf.byteLength, radix, 0, 0, 0);
        const ret = new ArrayBuffer(u32(len));
        _u256(U256Type.TOSTRING, changetype<usize>(this.buf), this.buf.byteLength, radix, 0, changetype<usize>(ret), 1);
        return String.UTF8.decode(ret);
    }

    static parse(str: string, radix: u8 = 10): U256 {
        const strbuf = String.UTF8.encode(str);
        const len = _u256(U256Type.PARSE, changetype<usize>(strbuf), strbuf.byteLength, radix, 0, 0, 0);
        const ret = new ArrayBuffer(u32(len));
        _u256(U256Type.PARSE, changetype<usize>(strbuf), strbuf.byteLength, radix, 0, changetype<usize>(ret), 1);
        return new U256(ret);
    }

    isPositive(): bool {
        return this.compareTo(U256.ZERO) > 0;
    }
}

export class Util {
    static concatBytes(a: ArrayBuffer, b: ArrayBuffer): ArrayBuffer {
        const len = _util(UtilType.CONCAT_BYTES, changetype<usize>(a), a.byteLength, changetype<usize>(b), b.byteLength, 0, 0);
        const buf = new ArrayBuffer(u32(len));
        _util(UtilType.CONCAT_BYTES, changetype<usize>(a), a.byteLength, changetype<usize>(b), b.byteLength, changetype<usize>(buf), 1);
        return buf;
    }

    // decode 
    static decodeHex(hex: string): ArrayBuffer {
        const str = this.str2bin(hex);
        const len = _util(UtilType.DECODE_HEX, changetype<usize>(str), str.byteLength, 0, 0, 0, 0);
        const buf = new ArrayBuffer(u32(len));
        _util(UtilType.DECODE_HEX, changetype<usize>(str), str.byteLength, 0, 0, changetype<usize>(buf), 1);
        return buf;
    }

    static encodeHex(data: ArrayBuffer): string {
        const len = _util(UtilType.ENCODE_HEX, changetype<usize>(data), data.byteLength, 0, 0, 0, 0);
        const buf = new ArrayBuffer(u32(len));
        _util(UtilType.ENCODE_HEX, changetype<usize>(data), data.byteLength, 0, 0, changetype<usize>(buf), 1);
        return String.UTF8.decode(buf);
    }

    static compareBytes(a: ArrayBuffer, b: ArrayBuffer): i32 {
        const x = Uint8Array.wrap(a);
        const y = Uint8Array.wrap(b);
        if (x.length > y.length)
            return 1;
        if (x.length < y.length)
            return -1;

        for (let i = 0; i < x.length; i++) {
            if (x[i] > y[i])
                return 1;
            if (x[i] < y[i])
                return -1;
        }
        return 0;
    }

    static str2bin(str: string): ArrayBuffer {
        return String.UTF8.encode(str);
    }

    // convert u64 to bytes without leading zeros
    static u64ToBytes(u: u64): ArrayBuffer {
        const len = _util(UtilType.U64_TO_BYTES, u, 0, 0, 0, 0, 0);
        const buf = new ArrayBuffer(u32(len));
        _util(UtilType.U64_TO_BYTES, u, 0, 0, 0, changetype<usize>(buf), 1);
        return buf;
    }

    static bytesToU64(bytes: ArrayBuffer): u64 {
        return _util(UtilType.BYTES_TO_U64, changetype<usize>(bytes), bytes.byteLength, 0, 0, 0, 0);
    }
}
