// @ts-ignore
@external("env", "_log")
declare function _log(offset: usize, len: usize): void;


// @ts-ignore
export function log(a: string): void {
    const str = String.UTF8.encode(a);
    _log(changetype<usize>(str), str.byteLength)
}


export class Hex {
    static encode(buf: Uint8Array): string {
        let out = "";
        for (let i = 0; i < buf.length; i++) {
            const a = buf[i] as u32;
            const b = a & 0xf;
            const c = a >> 4;

            let x: u32 = ((87 + b + (((b - 10) >> 8) & ~38)) << 8) | (87 + c + (((c - 10) >> 8) & ~38));
            out += String.fromCharCode(x as u8);
            x >>= 8;
            out += String.fromCharCode(x as u8);
        }
        return out;
    }

    private static hexToInt(x: u8): u8{
        if(<u8>48 <= x && x <= <u8>57) return x - <u8>48;
        if(<u8>97 <= x && x <= <u8>102) return x - <u8>87;
        if(<u8>65 <= x && x <= <u8>70) return x - <u8>55;
        return 0;
    }

    static decode(s: string): Uint8Array{
        assert(s.length % 2 == 0, 'invalid char');
        const ret = new Uint8Array(s.length / 2);
        for(let i: u32 = 0; i < u32(s.length/2) ; i++){
            const h: u8 = u8(s.charCodeAt(i * 2));
            const l: u8 = u8(s.charCodeAt(i * 2 + 1));
            ret[i] = (Hex.hexToInt(h) << 4) + Hex.hexToInt(l);
        }
        return ret;
    }
}

export * from './context';
export * from './decimal';
export * from './json';
export * from './result';
export * from './event'
export * from './rlp'
export * from './db';
