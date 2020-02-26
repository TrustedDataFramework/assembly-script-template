// @ts-ignore
@external("env", "_parameters")
declare function _parameters(ptr: usize): void;

// @ts-ignore
@external("env", "_parameters_len")
declare function _parameters_len(): usize;

// @ts-ignore
@external("env", "_parameters_available")
declare function _parameters_available(): u64;

export class Parameters {

    view: DataView;
    offset: u32;
    method: string;

    static load(): Parameters {
        assert(_parameters_available() != 0, 'contract deploy contains none parameters');
        const payload_len = _parameters_len();
        const payload = new ArrayBuffer(payload_len);
        _parameters(changetype<usize>(payload));
        const view = new DataView(payload, 0, payload_len);
        let params = new Parameters();
        params.view = view;
        params.offset = 0;
        params.method = params.string();
        return params;
    }

    string(): string {
        const len = this.u8();
        const arr = new Uint8Array(len);
        for(let i:u8 = 0; i < len; i++){
           arr[i] = this.u8();
        }
        return String.UTF8.decode(arr.buffer);
    }

    bytes(len: i32 = 0): Uint8Array {
        const buf = new Uint8Array(len > 0 ? len : this.u32());

        for (let i = 0; i < buf.byteLength; i++) {
            buf[i] = this.u8();
        }
        return buf;
    }

    bool(): bool {
        const v = this.u8();
        return v === <u8>1;
    }

    i8(): i8 {
        const v = this.view.getInt8(this.offset);
        this.offset += 1;
        return v;
    }

    i16(): i16 {
        const v = this.view.getInt16(this.offset, true);
        this.offset += 2;
        return v;
    }

    i32(): i32 {
        const v = this.view.getInt32(this.offset, true);
        this.offset += 4;
        return v;
    }

    i64(): i64 {
        const v = this.view.getInt64(this.offset, true);
        this.offset += 8;
        return v;
    }

    u8(): u8 {
        const v = this.view.getUint8(this.offset);
        this.offset += 1;
        return v;
    }

    u16(): u16 {
        const v = this.view.getUint16(this.offset, true);
        this.offset += 2;
        return v;
    }

    u32(): u32{
        const v = this.view.getUint32(this.offset, true);
        this.offset += 4;
        return v;
    }

    u64(): u64 {
        const v = this.view.getUint64(this.offset, true);
        this.offset += 8;

        return v;
    }

    remain(): i32 {
        return this.view.buffer.byteLength - this.offset
    }

    readAll(): Uint8Array{
        return this.bytes(this.remain());
    }
}
