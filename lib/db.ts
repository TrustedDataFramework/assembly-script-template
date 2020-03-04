// @ts-ignore
@external("env", "_db_set")
declare function _db_set(key_offset: usize, key_len: usize, value: usize, value_len: usize): void;

// @ts-ignore
@external("env", "_db_get_len")
declare function _db_get_len(key_offset: usize, key_len: usize): usize;

// @ts-ignore
@external("env", "_db_get")
declare function _db_get(key_offset: usize, key_len: usize, dst_offset: usize): void;


// @ts-ignore
@external("env", "_db_get")
declare function _db_has(key_offset: usize, key_len: usize): u64;

export class DB{
    set(key: Uint8Array, value: Uint8Array) : void{
        _db_set(
            changetype<usize>(key.buffer), key.buffer.byteLength,
            changetype<usize>(value.buffer), value.buffer.byteLength
        );
    }

    has(key: Uint8Array): bool{
        return _db_has(changetype<usize>(key.buffer), key.buffer.byteLength) != 0;
    }

    get(key: Uint8Array): Uint8Array{
        const len = _db_get_len(changetype<usize>(key.buffer), key.buffer.byteLength);
        const buf = new ArrayBuffer(len);
        _db_get(changetype<usize>(key.buffer), key.buffer.byteLength, changetype<usize>(buf));
        return Uint8Array.wrap(buf);
    }
}