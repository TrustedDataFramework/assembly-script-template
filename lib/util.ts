// @ts-ignore
@external("env", "_util")
// type, address, method, parameters, dst, put?
declare function _util(type: u64, ptr0: u64, ptr0Len: u64, ptr1: u64, ptr1Len: u64, dst: u64, put: u64): u64;

enum Type {
    CONCAT_BYTES,
    DECODE_HEX,
    ENCODE_HEX
}

export class Util {
    static concatBytes(a: ArrayBuffer, b: ArrayBuffer): ArrayBuffer {
        const len = _util(Type.CONCAT_BYTES, changetype<usize>(a), a.byteLength, changetype<usize>(b), b.byteLength, 0, 0);
        const buf = new ArrayBuffer(u32(len));
        _util(Type.CONCAT_BYTES, changetype<usize>(a), a.byteLength, changetype<usize>(b), b.byteLength, changetype<usize>(buf), 1);
        return buf;
    }

    // decode 
    static decodeHex(hex: string): ArrayBuffer {
        const str = this.string2bytes(hex);
        const len = _util(Type.DECODE_HEX, changetype<usize>(str), str.byteLength, 0, 0, 0, 0);
        const buf = new ArrayBuffer(u32(len));
        _util(Type.DECODE_HEX, changetype<usize>(str), str.byteLength, 0, 0, changetype<usize>(buf), 1);
        return buf;
    }

    static encodeHex(data: ArrayBuffer): string {
        const len = _util(Type.ENCODE_HEX, changetype<usize>(data), data.byteLength, 0, 0, 0, 0);
        const buf = new ArrayBuffer(u32(len));
        _util(Type.ENCODE_HEX, changetype<usize>(data), data.byteLength, 0, 0, changetype<usize>(buf), 1);
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

    static string2bytes(str: string): ArrayBuffer {
        return String.UTF8.encode(str);
    }
}