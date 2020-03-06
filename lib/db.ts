enum Type{
    SET, GET, REMOVE,HAS,NEXT,CURRENT_KEY, CURRENT_VALUE, HAS_NEXT,RESET
}

// @ts-ignore
@external("env", "_db")
declare function _db(type:u32, arg1: u64, arg2: u64, arg3: u64, arg4: u64): u64;

export class Entry{
    constructor(readonly key: Uint8Array, readonly value: Uint8Array) {
    }
}

export class DB{
    static set(key: Uint8Array, value: Uint8Array) : void{
        _db(
            Type.SET,
            changetype<usize>(key.buffer), key.buffer.byteLength,
            changetype<usize>(value.buffer), value.buffer.byteLength,
        );
    }

    static remove(key: Uint8Array) : void{
        _db(
            Type.REMOVE,
            changetype<usize>(key.buffer), key.buffer.byteLength,
            0,0,
        );
    }


    static has(key: Uint8Array): bool{
        return _db(Type.HAS, changetype<usize>(key.buffer), key.buffer.byteLength, 0, 0) != 0;
    }

    static get(key: Uint8Array): Uint8Array{
        const len = _db(Type.GET, changetype<usize>(key.buffer), key.buffer.byteLength, 0,0);
        const buf = new ArrayBuffer(i32(len));
        _db(Type.GET, changetype<usize>(key.buffer), key.buffer.byteLength, changetype<usize>(buf),1);
        return Uint8Array.wrap(buf);
    }


}

export class DBIterator{
    static next(): Entry{
        _db(Type.NEXT, 0,0,0,0);
        const keyBuf = new ArrayBuffer(i32(_db(Type.CURRENT_KEY, 0,0,0,0)));
        _db(Type.CURRENT_KEY, changetype<usize>(keyBuf), 1, 0,0);

        const valueBuf = new ArrayBuffer(_db(Type.CURRENT_VALUE, 0,0,0,0));
        _db(Type.CURRENT_KEY, changetype<usize>(valueBuf), 1, 0,0);
        return new Entry(Uint8Array.wrap(keyBuf), Uint8Array.wrap(valueBuf));
    }

    static hasNext(): bool{
        return _db(Type.HAS_NEXT, 0, 0, 0, 0) != 0;
    }

    static reset(): void{
        _db(Type.RESET, 0, 0, 0, 0);
    }
}