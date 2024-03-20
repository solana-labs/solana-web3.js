import {
    BaseTransaction,
    CompilableTransaction,
    compileMessage,
    createTransaction,
    getTransactionDecoder,
    ITransactionWithSignatures,
} from '@solana/transactions';
import { VersionedMessage } from '@solana/web3.js-legacy/declarations';

import { createUnimplementedFunction, getUnimplementedError } from './unimplemented.js';

export class VersionedTransaction {
    #tx: BaseTransaction | (BaseTransaction & ITransactionWithSignatures);
    constructor(message: VersionedMessage, _signatures?: Array<Uint8Array>) {
        if (message) {
            throw getUnimplementedError('Constructing a `VersionedTransaction`');
        }
        this.#tx = createTransaction({ version: 0 });
    }
    addSignature = createUnimplementedFunction('VersionedTransaction#addSignature');
    serialize = createUnimplementedFunction('VersionedTransaction#serialize');
    sign = createUnimplementedFunction('VersionedTransaction#sign');
    get message(): VersionedMessage {
        throw getUnimplementedError('VersionedTransaction#message (getter)');
    }
    get signatures(): Uint8Array[] {
        const {
            header: { numSignerAccounts },
            staticAccounts,
        } = compileMessage(this.#tx as unknown as CompilableTransaction);
        return staticAccounts.slice(0, numSignerAccounts).reduce((acc, account) => {
            acc.push('signatures' in this.#tx ? this.#tx.signatures[account] : new Uint8Array(64));
            return acc;
        }, [] as Uint8Array[]);
    }
    get version() {
        return this.#tx.version;
    }
    static deserialize(serializedTransaction: Uint8Array): VersionedTransaction {
        const newTransaction =
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore Hack to allow this method to construct an instance.
            new this();
        newTransaction.#tx = getTransactionDecoder().decode(serializedTransaction);
        return newTransaction;
    }
}
