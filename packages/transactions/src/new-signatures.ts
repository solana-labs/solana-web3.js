import { Address, getAddressFromPublicKey } from '@solana/addresses';
import { Decoder } from '@solana/codecs-core';
import { getBase58Decoder } from '@solana/codecs-strings';
import {
    SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING,
    SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING,
    SolanaError,
} from '@solana/errors';
import { Signature, SignatureBytes, signBytes } from '@solana/keys';

import { CompilableTransaction } from './compilable-transaction';
import { compileMessage } from './message';
import { TransactionMessageBytes } from './new-compile-transaction';
import { OrderedMap } from './ordered-map';
import { getCompiledMessageEncoder } from './serializers';

export interface INewTransactionWithSignatures {
    messageBytes: TransactionMessageBytes;
    signatures: OrderedMap<Address, SignatureBytes | null>;
}

export interface INewFullySignedTransaction extends INewTransactionWithSignatures {
    readonly __brand: unique symbol;
}

let base58Decoder: Decoder<string> | undefined;

export function newGetSignatureFromTransaction(transaction: INewTransactionWithSignatures): Signature {
    if (!base58Decoder) base58Decoder = getBase58Decoder();

    // We have ordered signatures from the compiled message accounts
    // first signature is the fee payer
    const signatureBytes = transaction.signatures.firstValue();
    if (!signatureBytes) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING);
    }
    const transactionSignature = base58Decoder.decode(signatureBytes);
    return transactionSignature as Signature;
}

export async function newPartiallySignTransaction<TTransaction extends CompilableTransaction>(
    keyPairs: CryptoKeyPair[],
    transaction: TTransaction,
): Promise<INewTransactionWithSignatures> {
    const compiledMessage = compileMessage(transaction);
    const transactionSigners = compiledMessage.staticAccounts.slice(0, compiledMessage.header.numSignerAccounts);
    const messageBytes = getCompiledMessageEncoder().encode(compiledMessage) as TransactionMessageBytes;

    const publicKeySignaturePairs = await Promise.all(
        keyPairs.map(keyPair =>
            Promise.all([getAddressFromPublicKey(keyPair.publicKey), signBytes(keyPair.privateKey, messageBytes)]),
        ),
    );
    const publickKeySignatureMap = new Map(publicKeySignaturePairs);

    const signatures = new OrderedMap<Address, SignatureBytes | null>();
    for (const signerAddress of transactionSigners) {
        const signature = publickKeySignatureMap.get(signerAddress) ?? null;
        signatures.set(signerAddress, signature);
    }

    const out: INewTransactionWithSignatures = {
        messageBytes,
        signatures,
    };
    Object.freeze(out);
    return out;
}

export async function newSignTransaction<TTransaction extends CompilableTransaction>(
    keyPairs: CryptoKeyPair[],
    transaction: TTransaction,
): Promise<INewFullySignedTransaction> {
    const out = await newPartiallySignTransaction(keyPairs, transaction);
    newAssertTransactionIsFullySigned(out);
    Object.freeze(out);
    return out;
}

export function newAssertTransactionIsFullySigned(
    transaction: INewTransactionWithSignatures,
): asserts transaction is INewFullySignedTransaction {
    const missingSigs: Address[] = [];
    transaction.signatures.forEach((address, signatureBytes) => {
        if (!signatureBytes) {
            missingSigs.push(address);
        }
    });

    if (missingSigs.length > 0) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
            addresses: missingSigs,
        });
    }
}
