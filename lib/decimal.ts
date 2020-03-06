enum Type{
    ADD, SUB,MUL, DIV,  COMPARE
}

// @ts-ignore
@external("env", "_decimal")
//result z
declare function _decimal(type: u32,
                          x_offset: usize, x_len: usize,
                          y_offset: usize, y_len: usize,
                          arg1: u64, arg2: u64,
                          put: u64
): u64;


// decimal will not be stored in memory
// please store decimal string and parse it next time
// e.g. use Map<string, string> other than Map<string, Decimal>
export class Decimal{
    static add(x: string, y: string): string{
        const str_x = String.UTF8.encode(x);
        const str_y = String.UTF8.encode(y);
        const len = _decimal(Type.ADD, changetype<usize>(str_x),str_x.byteLength,changetype<usize>(str_y),str_y.byteLength, 0, 0, 0);
        const result_buf = new ArrayBuffer(i32(len));
        _decimal(Type.ADD, changetype<usize>(str_x),str_x.byteLength,changetype<usize>(str_y),str_y.byteLength, changetype<usize>(result_buf), 0,1);
        return String.UTF8.decode(result_buf);
    }
    static sub(x: string, y: string): string{
        const str_x = String.UTF8.encode(x);
        const str_y = String.UTF8.encode(y);
        const result = _decimal(Type.SUB, changetype<usize>(str_x),str_x.byteLength,changetype<usize>(str_y),str_y.byteLength,0,0,0);
        const result_buf = new ArrayBuffer(result);
        _decimal(Type.SUB, changetype<usize>(str_x),str_x.byteLength,changetype<usize>(str_y),str_y.byteLength,changetype<usize>(result_buf), 0, 1);
        return String.UTF8.decode(result_buf);
    }
    static mul(x: string, y: string): string{
        const str_x = String.UTF8.encode(x);
        const str_y = String.UTF8.encode(y);
        const len = _decimal(Type.MUL, changetype<usize>(str_x),str_x.byteLength,changetype<usize>(str_y),str_y.byteLength, 0, 0, 0);
        const result_buf = new ArrayBuffer(i32(len));
        _decimal(Type.MUL, changetype<usize>(str_x),str_x.byteLength,changetype<usize>(str_y),str_y.byteLength, changetype<usize>(result_buf),0,1);
        return String.UTF8.decode(result_buf);
    }
    static div(x: string, y: string, precision: i32): string{
        const str_x = String.UTF8.encode(x);
        const str_y = String.UTF8.encode(y);
        const len = _decimal(Type.DIV, changetype<usize>(str_x),str_x.byteLength,changetype<usize>(str_y), str_y.byteLength,0,precision, 0);
        const result_buf = new ArrayBuffer(i32(len));
        _decimal(Type.DIV, changetype<usize>(str_x),str_x.byteLength,changetype<usize>(str_y), str_y.byteLength, changetype<usize>(result_buf), precision, 1);
        return String.UTF8.decode(result_buf);
    }
    static compare(x: string, y: string): i32{
        const str_x = String.UTF8.encode(x);
        const str_y = String.UTF8.encode(y);
        return _decimal(Type.COMPARE, changetype<usize>(str_x), str_x.byteLength, changetype<usize>(str_y), str_y.byteLength, 0, 0, 0);
    }
}