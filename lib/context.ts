// @ts-ignore
@external("env", "_context_transaction_hash")
declare function _context_transaction_hash(str_offset: usize): void;

// @ts-ignore
@external("env", "_context_transaction_hash_len")
declare function _context_transaction_hash_len(): usize;

// @ts-ignore
@external("env", "_context_method")
declare function _context_method(str_offset: usize): void;

// @ts-ignore
@external("env", "_context_method_len")
declare function _context_method_len(): usize;

// @ts-ignore
@external("env", "_context_sender")
declare function _context_sender(offset: usize): void;

// @ts-ignore
@external("env", "_context_sender_len")
declare function _context_sender_len(): usize;

// @ts-ignore
@external("env", "_context_recipient")
declare function _context_recipient(offset: usize): void;

// @ts-ignore
@external("env", "_context_recipient_len")
declare function _context_recipient_len(): usize;

// @ts-ignore
@external("env", "_context_amount")
declare function _context_amount(): usize;

// @ts-ignore
@external("env", "_context_gas_price")
declare function _context_gas_price(): usize;

// @ts-ignore
@external("env", "_context_block_timestamp")
declare function _context_block_timestamp(): usize;

// @ts-ignore
@external("env", "_context_transaction_timestamp")
declare function _context_transaction_timestamp(): usize;

// @ts-ignore
@external("env", "_context_block_height")
declare function _context_block_height(): usize;

// @ts-ignore
@external("env", "_context_parent_block_hash")
declare function _context_parent_block_hash(offset: usize): void;

// @ts-ignore
@external("env", "_context_parent_block_hash_len")
declare function _context_parent_block_hash_len(): usize;

// @ts-ignore
@external("env", "_context_nonce")
declare function _context_nonce(): u64;

// @ts-ignore
@external("env", "_context_signature_len")
declare function _context_signature_len(): usize;

// @ts-ignore
@external("env", "_context_signature")
declare function _context_signature(offset: usize): void;

// @ts-ignore
@external("env", "_context_available")
declare function _context_available(): u64;


/**
 * context.load() is only available when deploy/call contract
 */
export class Context{
    static load(): Context{
        assert(_context_available() > 0, 'Context.load() is not available');
        const transactionHash_len: usize = _context_transaction_hash_len();
        const transactionHash_buf: ArrayBuffer = new ArrayBuffer(transactionHash_len);
        _context_transaction_hash(changetype<usize>(transactionHash_buf));
        const transactionHash: Uint8Array = Uint8Array.wrap(transactionHash_buf);

        const method_len: usize = _context_method_len();
        const method_buf: ArrayBuffer = new ArrayBuffer(method_len);
        _context_method(changetype<usize>(method_buf));
        const method: string = String.UTF8.decode(method_buf);

        const sender_len: usize = _context_sender_len();
        const sender_buf: ArrayBuffer = new ArrayBuffer(sender_len);
        _context_sender(changetype<usize>(sender_buf));
        const sender: Uint8Array = Uint8Array.wrap(sender_buf);

        const recipient_len: usize = _context_recipient_len();
        const recipient_buf: ArrayBuffer = new ArrayBuffer(recipient_len);
        _context_recipient(changetype<usize>(recipient_buf));
        const recipient: Uint8Array =  Uint8Array.wrap(recipient_buf);


        const parentBlockHash_len: usize = _context_parent_block_hash_len();
        const parentBlockHash_buf: ArrayBuffer = new ArrayBuffer(parentBlockHash_len);
        _context_parent_block_hash(changetype<usize>(parentBlockHash_buf));

        const signature_len: usize = _context_signature_len();
        const signature_buf: ArrayBuffer = new ArrayBuffer(signature_len);
        _context_signature(changetype<usize>(signature_buf));
        return new Context(
            transactionHash,
            method,
            _context_nonce(),
            sender,
            recipient,
            _context_amount(),
            _context_gas_price(),
            _context_block_timestamp(),
            _context_transaction_timestamp(),
            _context_block_height(),
            Uint8Array.wrap(parentBlockHash_buf),
            Uint8Array.wrap(signature_buf)
        );
    }

    // TODO: parse block chain context
    // 1. transaction_hash
    // 2. from
    // 3. to
    // 4. amount, in contract call transaction, amount will be transfer to contract creator
    // 5. gas price
    // 6. block timestamp
    // 7. transaction timestamp
    // 8. block height
    // 9. parent block hash
    constructor(readonly transactionHash: Uint8Array,
                readonly method: string,
                readonly nonce: u64,
                readonly from: Uint8Array,
                readonly to: Uint8Array,
                readonly amount: u64,
                readonly gasPrice: u64,
                readonly blockTimestamp: u64,
                readonly transactionTimestamp: u64,
                readonly blockHeight: u64,
                readonly parentBlockHash: Uint8Array,
                readonly signature: Uint8Array
    ) {
    }
}