import {SafeMath} from './safemath'
import {RLP} from "./rlp";

export class Coin{
    constructor(readonly val: u64) {
    }

    add(c: Coin): Coin{
        return new Coin(SafeMath.add(this.val, c.val));
    }

    sub(c: Coin): Coin{
        return new Coin(SafeMath.sub(this.val, c.val));
    }

    static fromEncoded(data: Uint8Array): Coin{
        return new Coin(RLP.decodeU64(data));
    }

    getEncoded(): Uint8Array{
        return RLP.encodeU64(this.val)
    }
}
