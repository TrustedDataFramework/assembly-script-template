enum Type{
    JSON,STRING,I64,U64,BOOL,F64
}

// @ts-ignore
@external("env", "_json_builder_put")
declare function _json_builder_put(type: u32, key_offset: usize, key_len: usize, arg1: u64, arg2: u64): void;

// @ts-ignore
@external("env", "_json_builder_set")
declare function _json_builder_set(type:u32, idx: i32, arg1: u64, arg2: u64): void;

// @ts-ignore
@external("env", "_json_builder_build")
declare function _json_builder_build(ptr: usize): void;

// @ts-ignore
@external("env", "_json_builder_build_len")
declare function _json_builder_build_len(): usize;

// @ts-ignore
@external("env", "_json_reader_get_by_key")
declare function _json_reader_get_by_key(type: u32, ptr: usize, ptr_len: usize, key_offset: usize, key_len: usize, dst: usize, put: u64): u64;

// @ts-ignore
@external("env", "_json_reader_get_by_index")
declare function _json_reader_get_by_index(type:u32, ptr: usize, ptr_len: usize, idx: i32, dst: usize, put: u64): u64;



// link to java JsonElement
export class JSONBuilder {
    static putJSON(name: string, json: string): void {
        let buf_name: ArrayBuffer = String.UTF8.encode(name);
        let buf_json: ArrayBuffer = String.UTF8.encode(json);
        _json_builder_put(Type.JSON, changetype<usize>(buf_name), buf_name.byteLength, changetype<usize>(buf_json), buf_json.byteLength);
    }

    static setJSON(idx: i32, json: string): void {
        let buf_json: ArrayBuffer = String.UTF8.encode(json);
        _json_builder_set(Type.JSON, idx, changetype<usize>(buf_json), buf_json.byteLength);
    }

    static putString(name: string, value: string): void {
        let buf_name: ArrayBuffer = String.UTF8.encode(name);
        let buf_value: ArrayBuffer = String.UTF8.encode(value);
        _json_builder_put(Type.STRING, changetype<usize>(buf_name), buf_name.byteLength, changetype<usize>(buf_value), buf_value.byteLength);
    }

    static setString(idx: i32, value: string): void {
        let buf_json: ArrayBuffer = String.UTF8.encode(value);
        _json_builder_set(Type.STRING, idx, changetype<usize>(buf_json), buf_json.byteLength);
    }

    static putBool(name: string, value: bool): void {
        let buf_name: ArrayBuffer = String.UTF8.encode(name);
        _json_builder_put(Type.BOOL, changetype<usize>(buf_name), buf_name.byteLength, value ? 1 : 0, 0);
    }

    static setBool(idx: i32, value: bool): void {
        _json_builder_set(Type.BOOL, idx, value? 1: 0, 0);
    }

    static putI64(name: string, value: i64): void {
        let buf_name: ArrayBuffer = String.UTF8.encode(name);
        _json_builder_put(Type.I64, changetype<usize>(buf_name), buf_name.byteLength, u64(value), 0);
    }

    static setI64(idx: i32, value: i64): void {
        _json_builder_set(Type.I64, idx, u64(value), 0);
    }

    static putU64(name: string, value: u64): void {
        let buf_name: ArrayBuffer = String.UTF8.encode(name);
        _json_builder_put(Type.U64, changetype<usize>(buf_name), buf_name.byteLength, value, 0);
    }

    static setU64(idx: i32, value: u64): void {
        _json_builder_set(Type.U64, idx, value, 0);
    }

    static build(): string {
        const len = _json_builder_build_len();
        const ptr = new ArrayBuffer(len);
        _json_builder_build(changetype<usize>(ptr));
        return String.UTF8.decode(ptr);
    }
}

export class JSONReader {
    static getJSONByKey(json: string, key: string): string {
        let buf_json: ArrayBuffer = String.UTF8.encode(json);
        let buf_key: ArrayBuffer = String.UTF8.encode(key);
        const len = _json_reader_get_by_key(Type.JSON, changetype<usize>(buf_json), buf_json.byteLength, changetype<usize>(buf_key), buf_key.byteLength, 0, 0);
        const ptr = new ArrayBuffer(i32(len));
        _json_reader_get_by_key(Type.JSON, changetype<usize>(buf_json), buf_json.byteLength, changetype<usize>(buf_key), buf_key.byteLength, changetype<usize>(ptr), 1)
        return String.UTF8.decode(ptr);
    }

    static getJSONByIndex(json: string, idx: i32): string {
        let buf_json: ArrayBuffer = String.UTF8.encode(json);
        const len = _json_reader_get_by_index(Type.JSON, changetype<usize>(buf_json), buf_json.byteLength, idx, 0, 0);
        const ptr = new ArrayBuffer(len);
        _json_reader_get_by_index(Type.JSON, changetype<usize>(buf_json), buf_json.byteLength, idx, changetype<usize>(ptr), 1);
        return String.UTF8.decode(ptr);
    }

    static getStringByKey(json: string, name: string): string {
        let buf_json: ArrayBuffer = String.UTF8.encode(json);
        let buf_name: ArrayBuffer = String.UTF8.encode(name);
        let len = _json_reader_get_by_key(Type.STRING, changetype<usize>(buf_json), buf_json.byteLength, changetype<usize>(buf_name), buf_name.byteLength, 0, 0);
        const ptr = new ArrayBuffer(i32(len));
        _json_reader_get_by_key(Type.STRING, changetype<usize>(buf_json), buf_json.byteLength, changetype<usize>(buf_name), buf_name.byteLength, changetype<usize>(ptr), 1);
        return String.UTF8.decode(ptr);
    }

    static getStringByIndex(json: string, idx: i32): string {
        let buf_json: ArrayBuffer = String.UTF8.encode(json);
        const len = _json_reader_get_by_index(Type.STRING, changetype<usize>(buf_json), buf_json.byteLength, idx, 0, 0);
        let buf = new ArrayBuffer(i32(len));
        _json_reader_get_by_index(Type.STRING, changetype<usize>(buf_json), buf_json.byteLength, idx, changetype<usize>(buf), 1);
        return String.UTF8.decode(buf);
    }

    static getBoolByKey(json: string, key: string): bool {
        let buf_json: ArrayBuffer = String.UTF8.encode(json);
        let buf_key: ArrayBuffer = String.UTF8.encode(key);
        return _json_reader_get_by_key(Type.BOOL, changetype<usize>(buf_json), buf_json.byteLength, changetype<usize>(buf_key), buf_key.byteLength, 0, 0) != 0;
    }

    static getBoolByIndex(json: string, idx: i32): bool {
        let buf_json: ArrayBuffer = String.UTF8.encode(json);
        return _json_reader_get_by_index(Type.BOOL, changetype<usize>(buf_json), buf_json.byteLength, idx, 0, 0) != 0;
    }

    static getI64ByKey(json: string, key: string): i64 {
        let buf_json: ArrayBuffer = String.UTF8.encode(json);
        let buf_key: ArrayBuffer = String.UTF8.encode(key);
        return _json_reader_get_by_key(Type.I64, changetype<usize>(buf_json), buf_json.byteLength, changetype<usize>(buf_key), buf_key.byteLength, 0, 0);
    }

    static getI64ByIndex(json: string, idx: i32): i64 {
        let buf_json: ArrayBuffer = String.UTF8.encode(json);
        return _json_reader_get_by_index(Type.I64, changetype<usize>(buf_json), buf_json.byteLength, idx, 0, 0);
    }

    static getU64ByKey(json: string, key: string): u64 {
        let buf_json: ArrayBuffer = String.UTF8.encode(json);
        let buf_key: ArrayBuffer = String.UTF8.encode(key);
        return _json_reader_get_by_key(Type.U64, changetype<usize>(buf_json), buf_json.byteLength, changetype<usize>(buf_key), buf_key.byteLength, 0, 0);
    }

    static getU64ByIndex(json: string, idx: i32): u64 {
        let buf_json: ArrayBuffer = String.UTF8.encode(json);
        return _json_reader_get_by_index(Type.U64, changetype<usize>(buf_json), buf_json.byteLength, idx, 0, 0);
    }
}


