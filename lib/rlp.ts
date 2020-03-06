const OFFSET_SHORT_ITEM: u8 = 0x80;
const SIZE_THRESHOLD: u8 = 56;
const OFFSET_LONG_ITEM: u8 = 0xb7;
const OFFSET_SHORT_LIST: u8 = 0xc0;
const OFFSET_LONG_LIST: u8 = 0xf7;

export class RLP {
    // check the byte array was encoded from a list
    static isList(encoded: Uint8Array): bool {
        return encoded[0] >= OFFSET_SHORT_LIST;
    }

    static encodeU64(u: u64): Uint8Array{
        return encodeBytes(intToByteArray(u));
    }

    static decodeU64(u: Uint8Array): u64{
        return RLPItem.fromEncoded(u).u64();
    }

    static decodeString(encoded: Uint8Array): string{
        return RLPItem.fromEncoded(encoded).string();
    }


    // encode a string
    static encodeString(s: string): Uint8Array{
        return encodeBytes(Uint8Array.wrap(String.UTF8.encode(s)));
    }

    // encode string list
    static encodeStringArray(s: Array<string>): Uint8Array{
        const elements: Array<Uint8Array> = new Array<Uint8Array>(s.length);
        for(let i = 0; i < elements.length; i++){
            elements[i] = this.encodeString(s[i]);
        }
        return encodeElements(elements);
    }

    // encode a byte array
    static encodeBytes(bytes: Uint8Array): Uint8Array {
        return encodeBytes(bytes);
    }

    static encodeElements(elements: Array<Uint8Array>): Uint8Array {
        return encodeElements(elements);
    }
}

class RLPParser {
    buf: Uint8Array;
    offset: u32;
    limit: u32;

    constructor(buf: Uint8Array, offset: u32, limit: u32) {
        this.buf = buf;
        this.offset = offset;
        this.limit = limit;
    }

    prefixLength(): u32{
        const prefix = this.buf[this.offset];
        if (prefix <= OFFSET_LONG_ITEM) {
            return 1;
        }
        if (prefix < OFFSET_SHORT_LIST) {
            return 1 + (prefix - OFFSET_LONG_ITEM);
        }
        if (prefix <= OFFSET_LONG_LIST) {
            return 1;
        }
        return 1 + (prefix - OFFSET_LONG_LIST);
    }

    remained(): u32 {
        return this.limit - this.offset;
    }

    skip(n: u32): void{
        this.offset += n;
    }

    peekSize(): u32 {
        const prefix = this.buf[this.offset];
        if (prefix < OFFSET_SHORT_ITEM) {
            return 1;
        }
        if (prefix <= OFFSET_LONG_ITEM) {
            return prefix - OFFSET_SHORT_ITEM + 1;
        }
        if (prefix < OFFSET_SHORT_LIST) {
            return u32(byteArrayToInt(
                copyOfRange(this.buf, 1 + this.offset, 1 + this.offset + prefix - OFFSET_LONG_ITEM)
            ) + 1 + prefix - OFFSET_LONG_ITEM);
        }
        if (prefix <= OFFSET_LONG_LIST) {
            return prefix - OFFSET_SHORT_LIST + 1;
        }
        return u32(byteArrayToInt(
            copyOfRange(this.buf, 1 + this.offset, this.offset + 1 + prefix - OFFSET_LONG_LIST)
            )
            + 1 + prefix - OFFSET_LONG_LIST);
    }

    u8(): u8 {
        const ret = this.buf[this.offset];
        this.offset++;
        return ret;
    }

    bytes(n: u32): Uint8Array {
        assert(this.offset + n <= this.limit, 'read overflow');
        const ret = this.buf.slice(this.offset, this.offset + n);
        this.offset += n;
        return ret;
    }
}

function intToByteArray(u: u64): Uint8Array{
    const buf = new Uint8Array(8);
    for(let i = 0; i < 8; i++){
        buf[buf.length - 1 - i] = u8(u & 0xff);
        u = u >>> 8;
    }
    let k = 8;
    for(let i = 0; i < 8; i++){
        if(buf[i] != 0){
            k = i;
            break;
        }
    }
    return buf.slice(k, buf.length);
}

function byteArrayToInt(bytes: Uint8Array): u64 {
    let ret: u64 = 0;
    for (let i: u32 = 0; i < u32(bytes.length); i++) {
        const u = u64(bytes[bytes.length - i - 1]);
        ret += (u << (i * 8))
    }
    return ret;
}

function copyOfRange(bytes: Uint8Array, from: u32, to: u32): Uint8Array {
    const ret: Uint8Array = new Uint8Array(to - from);
    let j: u32 = 0;
    for (let i = from; i < to; i++) {
        ret[j] = bytes[i];
        j++;
    }
    return ret;
}

function estimateSize(encoded: Uint8Array): u32 {
    const parser = new RLPParser(encoded, 0, encoded.length);
    return parser.peekSize();
}

function validateSize(encoded: Uint8Array): void {
    assert(encoded.length == estimateSize(encoded), 'invalid rlp format');
}


export class RLPItem {
    static NULL: RLPItem = new RLPItem(new Uint8Array(0));
    // before encoded data
    private readonly data: Uint8Array;

    private constructor(data: Uint8Array) {
        this.data = data;
    }

    static fromEncoded(encoded: Uint8Array): RLPItem {
        assert(!RLP.isList(encoded), 'not a rlp item');
        validateSize(encoded);
        const parser = new RLPParser(encoded, 0, encoded.length);
        if(encoded.length == 1 && encoded[0] == 0x80)
            return RLPItem.NULL;
        if(parser.remained() > 1){
            parser.skip(parser.prefixLength());
        }
        return new RLPItem(parser.bytes(parser.remained()));
    }

    u8(): u8 {
        assert(this.u64() <= u8.MAX_VALUE, 'integer overflow');
        return u8(this.u64());
    }

    u16(): u16 {
        assert(this.u64() <= u16.MAX_VALUE, 'integer overflow');
        return u16(this.u64());
    }

    u32(): u32 {
        assert(this.u64() <= u32.MAX_VALUE, 'integer overflow');
        return u32(this.u64());
    }

    u64(): u64 {
        assert(this.data.length <= 8, 'not a u64');
        return byteArrayToInt(this.data);
    }

    bytes(): Uint8Array {
        return this.data
    }

    string(): string {
        return String.UTF8.decode(this.data.buffer);
    }

    isNull(): bool{
        return this.data.length == 0;
    }
}

export class RLPList {
    static EMPTY: RLPList = new RLPList([]);
    private readonly elements: Array<Uint8Array>;

    private constructor(elements: Array<Uint8Array>) {
        this.elements = elements;
    }

    static fromEncoded(encoded: Uint8Array): RLPList {
        assert(RLP.isList(encoded), 'not a rlp list');
        validateSize(encoded);
        const parser = new RLPParser(encoded, 0, encoded.length);
        parser.skip(parser.prefixLength());
        const ret = new RLPList([]);
        while (parser.remained() > 0) {
            ret.elements.push(parser.bytes(parser.peekSize()));
        }
        return ret;
    }

    getItem(index: u32): RLPItem {
        return RLPItem.fromEncoded(this.getRaw(index));
    }

    getList(index: u32): RLPList {
        return RLPList.fromEncoded(this.getRaw(index))
    }

    length(): u32 {
        return this.elements.length;
    }

    getRaw(index: u32): Uint8Array {
        return this.elements[index];
    }

    isNull(index: u32): bool{
        return this.elements[index].length == 1 && this.elements[index][0] == 0x80;
    }
}


function encodeBytes(bytes: Uint8Array): Uint8Array {
    if (bytes.length == 0) {
        const ret: Uint8Array = new Uint8Array(1);
        ret[0] = OFFSET_SHORT_ITEM;
        return ret;
    }
    if (bytes.length == 1 && (bytes[0] & 0xFF) < OFFSET_SHORT_ITEM) {
        return bytes;
    }
    if (u32(bytes.length) < SIZE_THRESHOLD) {
        // length = 8X
        const prefix = OFFSET_SHORT_ITEM + bytes.length;
        const ret: Uint8Array = new Uint8Array(bytes.length + 1);
        for (let i = 0; i < bytes.length; i++) {
            ret[i + 1] = bytes[i];
        }
        ret[0] = prefix;
        return ret;
    }
    let tmpLength: u32 = bytes.length;
    let lengthOfLength: u8 = 0;
    while (tmpLength != 0) {
        lengthOfLength = lengthOfLength + 1;
        tmpLength = tmpLength >> 8;
    }

    const ret: Uint8Array = new Uint8Array(1 + lengthOfLength + bytes.length);
    ret[0] = OFFSET_LONG_ITEM + lengthOfLength;

    // copy length after first byte
    tmpLength = bytes.length;
    for (let i = lengthOfLength; i > 0; --i) {
        ret[i] = (tmpLength & 0xFF);
        tmpLength = tmpLength >> 8;
    }
    for (let i = 0; i < bytes.length; i++) {
        ret[i + 1 + lengthOfLength] = bytes[i]
    }
    return ret;
}


function encodeElements(elements: Array<Uint8Array>): Uint8Array {
    let totalLength: u32 = 0;
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        totalLength += el.length;
    }
    let data: Uint8Array;
    let copyPos: u32;
    if (totalLength < u32(SIZE_THRESHOLD)) {
        data = new Uint8Array(1 + totalLength);
        data[0] = OFFSET_SHORT_LIST + totalLength;
        copyPos = 1;
    } else {
        // length of length = BX
        // prefix = [BX, [length]]
        let tmpLength: u32 = totalLength;
        let byteNum: u8 = 0;
        while (tmpLength != 0) {
            ++byteNum;
            tmpLength = tmpLength >> 8;
        }
        tmpLength = totalLength;
        let lenBytes: Uint8Array = new Uint8Array(byteNum);
        for (let i:u32 = 0; i < byteNum; ++i) {
            lenBytes[byteNum - 1 - i] = ((tmpLength >> (8 * i)) & 0xFF);
        }
        // first byte = F7 + bytes.length
        data = new Uint8Array(1 + lenBytes.length + totalLength);
        data[0] = OFFSET_LONG_LIST + byteNum;
        for (let i = 0; i < lenBytes.length; i++) {
            data[i + 1] = lenBytes[i];
        }
        copyPos = lenBytes.length + 1;
    }
    for (let i = 0; i < elements.length; i++) {
        const el: Uint8Array = elements[i];
        for (let j = 0; j < el.length; j++) {
            data[j + copyPos] = el[j];
        }
        copyPos += el.length;
    }
    return data;
}