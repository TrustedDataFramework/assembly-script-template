const OFFSET_SHORT_ITEM: u8 = 0x80;
const SIZE_THRESHOLD: u8 = 56;
const OFFSET_LONG_ITEM: u8 = 0xb7;
const OFFSET_SHORT_LIST:u8 = 0xc0;
const OFFSET_LONG_LIST: u8 = 0xf7;

export class RLP{
    static isList(encoded: Uint8Array): bool{
        return encoded[0] >= OFFSET_SHORT_LIST;
    }
    static encodeBytes(bytes: Uint8Array): Uint8Array{
        return encodeBytes(bytes);
    }
    static encodeElements(elements: Array<Uint8Array>): Uint8Array{
        return encodeElements(elements);
    }
}

function byteArrayToInt(bytes: Uint8Array): u64{
    let ret: u64 = 0;
    for(let i = 0; i < bytes.length; i++){
        const u: u8 = bytes[bytes.length - i - 1];
        ret += (u << i)
    }
    return ret;
}

function copyOfRange(bytes: Uint8Array, from: u32, to: u32) : Uint8Array{
    const ret: Uint8Array = new Uint8Array(to - from);
    let j: u32 = 0;
    for(let i = from; i < to; i++){
        ret[j] = bytes[i];
        j++;
    }
    return ret;
}

function estimateSize(encoded: Uint8Array): u32{
    const prefix: u8 = encoded[0];
    if (prefix < OFFSET_SHORT_ITEM) {
        return 1;
    }
    if (prefix <= OFFSET_LONG_ITEM) {
        return prefix - OFFSET_SHORT_ITEM + 1;
    }
    if (prefix < OFFSET_SHORT_LIST) {
        return byteArrayToInt(
            copyOfRange(encoded,  1,  1 + prefix - OFFSET_LONG_ITEM)
        ) + 1 + prefix - OFFSET_LONG_ITEM;
    }
    if (prefix <= OFFSET_LONG_LIST) {
        return prefix - OFFSET_SHORT_LIST + 1;
    }
    return byteArrayToInt(copyOfRange(encoded,  1,  1 + prefix - OFFSET_LONG_LIST)) + 1 + prefix - OFFSET_LONG_LIST;
}

function validateSize(encoded: Uint8Array): void{
    assert(encoded.length == estimateSize(encoded), 'invalid rlp format');
}


export class RLPItem{
    static NULL: RLPItem = new RLPItem(new Uint8Array(0));

    static fromEncoded(encoded: Uint8Array): RLPItem{
        const prefix = encoded[0];
        if (prefix < OFFSET_SHORT_ITEM) {
            const data: Uint8Array = new Uint8Array(1);
            data[0] = prefix;
            return new RLPItem(data);
        }
        if (prefix <= OFFSET_LONG_ITEM) {
            const length: u32 = prefix - OFFSET_SHORT_ITEM;
            if (length == 0) return RLPItem.NULL;
            RLPItem item = new RLPItem(new LazyByteArray(raw, offset, offset + length));
            skip(length);
            return item;
        }
        return RLPItem.NULL;
    }

    // before encoded data
    private readonly data: Uint8Array;

    private constructor(data: Uint8Array) {
        this.data = data;
    }

    u8(): u8{
        return 0;
    }
    u16(): u16{
        return 0;
    }
    u32(): u32{
       return 0;
    }
    u64(): u64{
        assert(this.data.length <= 8, 'not a u64');
        let ret: u64 = 0;
        for(let i = 0; i < this.data.length; i++){
            const u: u8 = this.data[this.data.length - i - 1];
            ret += (u << i)
        }
        return ret;
    }
    i8(): i8{
        return 0;
    }
    i16(): i16{
        return 0;
    }
    i32(): i32{
        return 0;
    }
    i64(): i64{
        return 0;
    }
    bytes(): Uint8Array{
        return this.data
    }
    string(): string{
        return String.UTF8.decode(this.data.buffer);
    }
}

export class RLPList{
    static EMPTY: RLPList = new RLPList([]);
    private readonly elements: Array<Uint8Array>;

    static fromEncoded(encoded: Uint8Array): RLPList{
        assert(RLP.isList(encoded), 'not a rlp list');
        validateSize(encoded);
        
    }

    private constructor(elements: Array<Uint8Array>) {
        this.elements = elements;
    }

    getItem(index: u32): RLPItem{
        return decodeItem(this.getRaw(index));
    }
    getList(index: u32): RLPList{
        return decodeList(this.getRaw(index))
    }
    length(): u32{
        return this.elements.length;
    }
    getRaw(index: u32): Uint8Array{
        return this.elements[index];
    }
}




function encodeBytes(bytes: Uint8Array): Uint8Array{
    if(bytes.length == 0){
        const ret: Uint8Array = new Uint8Array(1);
        ret[0] = OFFSET_SHORT_ITEM;
        return ret;
    }
    if (bytes.length == 1 && (bytes[0] & 0xFF) < OFFSET_SHORT_ITEM) {
        return bytes;
    }
    if (bytes.length < SIZE_THRESHOLD) {
        // length = 8X
        const length:u8 = OFFSET_SHORT_ITEM + bytes.length;
        const ret: Uint8Array = new Uint8Array(bytes.length);
        for(let i = 0; i < bytes.length; i++){
            ret[i + 1] = bytes[i];
        }
        ret[0] = length;
        return ret;
    }
    let tmpLength:u32 =bytes.length;
    let lengthOfLength:u8 =0;
    while (tmpLength != 0){
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
    for(let i = 0; i < bytes.length; i++){
        ret[i + 1 + lengthOfLength] = bytes[i]
    }
    return ret;
}


function encodeElements(elements: Array<Uint8Array>): Uint8Array{
    let totalLength: u32 = 0;
    for(let i = 0; i < elements.length; i++){
        totalLength += elements.length;
    }

    let data: Uint8Array;
    let copyPos: u32;
    if (totalLength < SIZE_THRESHOLD) {
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
        for (let i = 0; i < byteNum; ++i) {
            lenBytes[byteNum - 1 - i] = ((tmpLength >> (8 * i)) & 0xFF);
        }
        // first byte = F7 + bytes.length
        data = new Uint8Array(1 + lenBytes.length + totalLength);
        data[0] = OFFSET_LONG_LIST + byteNum;
        for(let i = 0; i < lenBytes.length; i++){
            data[i + 1] = lenBytes[i];
        }
        copyPos = lenBytes.length + 1;
    }
    for(let i = 0; i < elements.length; i++){
        const el: Uint8Array = elements[i];
        for(let i = 0; i < el.length; i++){
            data[i + copyPos] = data[i];
        }
        copyPos += el.length;
    }
    return data;
}