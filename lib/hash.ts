enum Algorithm{
    SM3, KECCAK256
}

// @ts-ignore
@external("env", "_hash")
declare function _hash(type: u32, ptr: usize, ptr_len: usize, dst: usize, put: u64): u64;

export class Hash {
    private static hash(data: Uint8Array, alg: Algorithm): Uint8Array{
        const len = _hash(alg, changetype<usize>(data.buffer), data.buffer.byteLength, 0, 0);
        let res = new ArrayBuffer(i32(len));
        _hash(alg, changetype<usize>(data.buffer), data.buffer.byteLength, changetype<usize>(res), 1);
        return Uint8Array.wrap(res);
    }

    static keccak256(data: Uint8Array): Uint8Array{
        return Hash.hash(data, Algorithm.KECCAK256);
    }

    static sm3(data: Uint8Array): Uint8Array{
        return Hash.hash(data, Algorithm.SM3);
    }
}