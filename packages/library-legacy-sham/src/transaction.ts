import { Address } from '@solana/addresses';
import {
    BaseTransaction,
    createTransaction,
    getTransactionDecoder,
    ITransactionWithFeePayer,
    ITransactionWithSignatures,
    setTransactionFeePayer,
} from '@solana/transactions';
import {
    SignaturePubkeyPair,
    TransactionBlockhashCtor,
    TransactionCtorFields_DEPRECATED,
    TransactionInstruction,
    TransactionNonceCtor,
} from '@solana/web3.js-legacy/declarations';

import { PublicKey } from './public-key';
import { createUnimplementedFunction, getUnimplementedError } from './unimplemented';

export class Transaction {
    #tx: BaseTransaction | (BaseTransaction & ITransactionWithSignatures);
    constructor(opts?: TransactionBlockhashCtor | TransactionNonceCtor | TransactionCtorFields_DEPRECATED) {
        if (opts) {
            throw getUnimplementedError('Constructing a `Transaction` with options');
        }
        this.#tx = createTransaction({ version: 'legacy' });
    }
    add = createUnimplementedFunction('Transaction#add');
    addSignature = createUnimplementedFunction('Transaction#addSignature');
    compileMessage = createUnimplementedFunction('Transaction#compileMessage');
    getEstimatedFee = createUnimplementedFunction('Transaction#getEstimatedFee');
    partialSign = createUnimplementedFunction('Transaction#partialSign');
    serializeMessage = createUnimplementedFunction('Transaction#serializeMessage');
    serialize = createUnimplementedFunction('Transaction#serialize');
    setSigners = createUnimplementedFunction('Transaction#setSigners');
    sign = createUnimplementedFunction('Transaction#sign');
    verifySignatures = createUnimplementedFunction('Transaction#verifySignatures');
    get feePayer(): PublicKey | undefined {
        if ('feePayer' in this.#tx) {
            return new PublicKey((this.#tx as ITransactionWithFeePayer).feePayer);
        }
    }
    set feePayer(publicKey: { toBase58: () => string }) {
        const addressString = publicKey.toBase58();
        this.#tx = setTransactionFeePayer(addressString as Address, this.#tx);
    }
    get instructions(): Array<TransactionInstruction> {
        throw getUnimplementedError('Transaction#instructions (getter)');
    }
    get signature(): Buffer | null {
        if ('feePayer' in this.#tx && 'signatures' in this.#tx) {
            const signatureBytes = this.#tx.signatures[(this.#tx as ITransactionWithFeePayer).feePayer];
            return __NODEJS__ ? Buffer.from(signatureBytes) : (signatureBytes as unknown as Buffer);
        } else {
            return null;
        }
    }
    get signatures(): Array<SignaturePubkeyPair> {
        throw getUnimplementedError('Transaction#signatures (getter)');
    }
    static from(data: Buffer | Uint8Array | Array<number>) {
        const newTransaction = new this();
        const byteArray = Array.isArray(data) ? new Uint8Array(data) : data;
        newTransaction.#tx = getTransactionDecoder().decode(byteArray)[0];
        return newTransaction;
    }
    static populate = createUnimplementedFunction('Transaction#populate');
}
