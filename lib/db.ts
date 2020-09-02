
import {Util} from './util'

enum Type {
    SET, GET, REMOVE, HAS, NEXT, CURRENT_KEY, CURRENT_VALUE, HAS_NEXT, RESET
}

// @ts-ignore
@external("env", "_db")
declare function _db(type: u64, arg1: u64, arg2: u64, arg3: u64, arg4: u64): u64;

export class Entry {
    constructor(readonly key: ArrayBuffer, readonly value: ArrayBuffer) {
    }
}


export class PrefixedDB {
    constructor(readonly prefix: ArrayBuffer, readonly wrapped: PrefixedDB | null = null) {
    }

    set(key: ArrayBuffer, value: ArrayBuffer): void {
        if (this.wrapped == null) {
            DB.set(Util.concatBytes(this.prefix, key), value);
            return;
        }
        this.wrapped.set(Util.concatBytes(this.prefix, key), value);
    }

    remove(key: ArrayBuffer): void {
        if (this.wrapped == null) {
            DB.remove(Util.concatBytes(this.prefix, key));
            return;
        }
        this.wrapped.remove(Util.concatBytes(this.prefix, key));
    }

    has(key: ArrayBuffer): bool {
        if (this.wrapped == null) {
            return DB.has(Util.concatBytes(this.prefix, key));
        }
        return this.wrapped.has(Util.concatBytes(this.prefix, key));
    }

    get(key: ArrayBuffer): ArrayBuffer {
        if (this.wrapped == null) {
            return DB.get(Util.concatBytes(this.prefix, key));
        }
        return this.wrapped.get(Util.concatBytes(this.prefix, key));
    }
}

export class DB {
    static set(key: ArrayBuffer, value: ArrayBuffer): void {
        _db(
            Type.SET,
            changetype<usize>(key), key.byteLength,
            changetype<usize>(value), value.byteLength,
        );
    }

    static remove(key: ArrayBuffer): void {
        _db(
            Type.REMOVE,
            changetype<usize>(key), key.byteLength,
            0, 0,
        );
    }


    static has(key: ArrayBuffer): bool {
        return _db(Type.HAS, changetype<usize>(key), key.byteLength, 0, 0) != 0;
    }

    static get(key: ArrayBuffer): ArrayBuffer {
        const len = _db(Type.GET, changetype<usize>(key), key.byteLength, 0, 0);
        const buf = new ArrayBuffer(i32(len));
        _db(Type.GET, changetype<usize>(key), key.byteLength, changetype<usize>(buf), 1);
        return buf;
    }


}

export class DBIterator {
    static next(): Entry {
        _db(Type.NEXT, 0, 0, 0, 0);
        const keyBuf = new ArrayBuffer(i32(_db(Type.CURRENT_KEY, 0, 0, 0, 0)));
        _db(Type.CURRENT_KEY, changetype<usize>(keyBuf), 1, 0, 0);

        const valueBuf = new ArrayBuffer(_db(Type.CURRENT_VALUE, 0, 0, 0, 0));
        _db(Type.CURRENT_KEY, changetype<usize>(valueBuf), 1, 0, 0);
        return new Entry(keyBuf, valueBuf);
    }

    static hasNext(): bool {
        return _db(Type.HAS_NEXT, 0, 0, 0, 0) != 0;
    }

    static reset(): void {
        _db(Type.RESET, 0, 0, 0, 0);
    }
}