import { Address } from '@solana/addresses';
import { assertIsBlockhash, type Blockhash } from '@solana/rpc-types';
import {
    assertTransactionIsFullySigned,
    BaseTransaction,
    CompilableTransaction,
    createTransaction,
    getTransactionDecoder,
    getTransactionEncoder,
    ITransactionWithBlockhashLifetime,
    ITransactionWithFeePayer,
    ITransactionWithSignatures,
    Nonce,
    setTransactionFeePayer,
    setTransactionLifetimeUsingBlockhash,
    setTransactionLifetimeUsingDurableNonce,
} from '@solana/transactions';
import {
    Blockhash as LegacyBlockhash,
    NonceInformation,
    SerializeConfig,
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
    constructor(opts?: TransactionBlockhashCtor | TransactionCtorFields_DEPRECATED | TransactionNonceCtor) {
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
    serialize(config?: SerializeConfig): Buffer {
        if (config?.requireAllSignatures) {
            assertTransactionIsFullySigned(this.#tx as CompilableTransaction & ITransactionWithSignatures);
        }
        if (config?.verifySignatures) {
            throw new Error(
                'The `verifySignatures` option of `Transaction#serialize` is unimplemented in ' +
                    '`@solana/web3.js-legacy-sham`. If the caller of this method is code that ' +
                    "you don't maintain, and part of a dependency that you can not replace, let " +
                    'us know: https://github.com/solana-labs/solana-web3.js/issues/new/choose',
            );
        }
        const byteArray = getTransactionEncoder().encode(this.#tx as CompilableTransaction);
        return __NODEJS__ ? Buffer.from(byteArray) : (byteArray as Buffer);
    }
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
    get lastValidBlockHeight(): number | undefined {
        if (
            'lifetimeConstraint' in this.#tx &&
            this.#tx.lifetimeConstraint != null &&
            typeof this.#tx.lifetimeConstraint === 'object' &&
            'blockhash' in this.#tx.lifetimeConstraint
        ) {
            return Number((this.#tx as ITransactionWithBlockhashLifetime).lifetimeConstraint.lastValidBlockHeight);
        }
    }
    set lastValidBlockHeight(slot: number | null | undefined) {
        this.#tx = setTransactionLifetimeUsingBlockhash(
            {
                // Use the existing value or set it to `undefined` otherwise.
                blockhash:
                    'lifetimeConstraint' in this.#tx &&
                    this.#tx.lifetimeConstraint != null &&
                    typeof this.#tx.lifetimeConstraint === 'object' &&
                    'blockhash' in this.#tx.lifetimeConstraint
                        ? (this.#tx as ITransactionWithBlockhashLifetime).lifetimeConstraint.blockhash
                        : (undefined as unknown as Blockhash),
                lastValidBlockHeight: BigInt(slot ?? Number.MAX_SAFE_INTEGER),
            },
            this.#tx,
        );
    }
    get nonceInfo() {
        throw getUnimplementedError('Transaction#nonceInfo (getter)');
    }
    set nonceInfo(nonceInfo: NonceInformation) {
        this.#tx = setTransactionLifetimeUsingDurableNonce(
            {
                nonce: nonceInfo.nonce as Nonce<typeof nonceInfo.nonce>,
                nonceAccountAddress: nonceInfo.nonceInstruction.keys[0].pubkey.toBase58() as Address,
                nonceAuthorityAddress: nonceInfo.nonceInstruction.keys[2].pubkey.toBase58() as Address,
            },
            this.#tx,
        );
    }
    get recentBlockhash(): LegacyBlockhash | undefined {
        if (
            'lifetimeConstraint' in this.#tx &&
            this.#tx.lifetimeConstraint != null &&
            typeof this.#tx.lifetimeConstraint === 'object' &&
            'blockhash' in this.#tx.lifetimeConstraint
        ) {
            return (this.#tx as ITransactionWithBlockhashLifetime).lifetimeConstraint.blockhash;
        }
    }
    set recentBlockhash(putativeBlockhash: LegacyBlockhash) {
        assertIsBlockhash(putativeBlockhash);
        this.#tx = setTransactionLifetimeUsingBlockhash(
            {
                blockhash: putativeBlockhash,
                lastValidBlockHeight:
                    // Use the existing value or set it to `Number.MAX_SAFE_INTEGER` otherwise.
                    'lifetimeConstraint' in this.#tx &&
                    this.#tx.lifetimeConstraint != null &&
                    typeof this.#tx.lifetimeConstraint === 'object' &&
                    'lastValidBlockHeight' in this.#tx.lifetimeConstraint
                        ? (this.#tx as ITransactionWithBlockhashLifetime).lifetimeConstraint.lastValidBlockHeight
                        : BigInt(Number.MAX_SAFE_INTEGER),
            },
            this.#tx,
        );
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
    static from(data: Array<number> | Buffer | Uint8Array) {
        const newTransaction = new this();
        const byteArray = Array.isArray(data) ? new Uint8Array(data) : data;
        newTransaction.#tx = getTransactionDecoder().decode(byteArray);
        return newTransaction;
    }
    static populate = createUnimplementedFunction('Transaction#populate');
}
