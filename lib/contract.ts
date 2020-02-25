// @ts-ignore
@external("env", "_contract_address_len")
declare function _contract_address_len(): usize;

// @ts-ignore
@external("env", "_contract_address")
declare function _contract_address(offset: usize): void;

// @ts-ignore
@external("env", "_contract_created_by_len")
declare function _contract_created_by_len(): usize;

// @ts-ignore
@external("env", "_contract_created_by")
declare function _contract_created_by(offset: usize): void;


export class Contract {
    static load(): Contract {
        const address_len: usize = _contract_address_len();
        const address_buf: ArrayBuffer = new ArrayBuffer(address_len);
        _contract_address(changetype<usize>(address_buf));

        const created_by_len: usize = _contract_created_by_len();
        const created_by_buf: ArrayBuffer = new ArrayBuffer(created_by_len);
        _contract_created_by(changetype<usize>(created_by_buf));
        return new Contract(Uint8Array.wrap(created_by_buf), Uint8Array.wrap(address_buf));
    }

    constructor(
        readonly createdBy: Uint8Array,
        readonly address: Uint8Array
    ) {}
}