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
import { getCompiledMessageEncoder } from './serializers';

export type OrderedMap<K extends string, V> = Record<K, V>;

export interface NewTransaction {
    messageBytes: TransactionMessageBytes;
    signatures: OrderedMap<Address, SignatureBytes | null>;
}

export interface FullySignedTransaction extends NewTransaction {
    readonly __brand: unique symbol;
}

let base58Decoder: Decoder<string> | undefined;

export function newGetSignatureFromTransaction(transaction: NewTransaction): Signature {
    if (!base58Decoder) base58Decoder = getBase58Decoder();

    // We have ordered signatures from the compiled message accounts
    // first signature is the fee payer
    const signatureBytes = Object.values(transaction.signatures)[0];
    if (!signatureBytes) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING);
    }
    const transactionSignature = base58Decoder.decode(signatureBytes);
    return transactionSignature as Signature;
}

export async function newPartiallySignTransaction<TTransaction extends CompilableTransaction>(
    keyPairs: CryptoKeyPair[],
    transaction: TTransaction,
): Promise<NewTransaction> {
    const compiledMessage = compileMessage(transaction);
    const transactionSigners = compiledMessage.staticAccounts.slice(0, compiledMessage.header.numSignerAccounts);
    const messageBytes = getCompiledMessageEncoder().encode(compiledMessage) as TransactionMessageBytes;

    const publicKeySignaturePairs = await Promise.all(
        keyPairs.map(keyPair =>
            Promise.all([getAddressFromPublicKey(keyPair.publicKey), signBytes(keyPair.privateKey, messageBytes)]),
        ),
    );
    const publickKeySignatureMap = new Map(publicKeySignaturePairs);

    const signatures: OrderedMap<Address, SignatureBytes | null> = {};
    for (const signerAddress of transactionSigners) {
        const signature = publickKeySignatureMap.get(signerAddress) ?? null;
        signatures[signerAddress] = signature;
    }

    const out: NewTransaction = {
        messageBytes,
        signatures,
    };
    Object.freeze(out);
    return out;
}

export async function newSignTransaction<TTransaction extends CompilableTransaction>(
    keyPairs: CryptoKeyPair[],
    transaction: TTransaction,
): Promise<FullySignedTransaction> {
    const out = await newPartiallySignTransaction(keyPairs, transaction);
    newAssertTransactionIsFullySigned(out);
    Object.freeze(out);
    return out;
}

export function newAssertTransactionIsFullySigned(
    transaction: NewTransaction,
): asserts transaction is FullySignedTransaction {
    const missingSigs: Address[] = [];
    Object.entries(transaction.signatures).forEach(([address, signatureBytes]) => {
        if (!signatureBytes) {
            missingSigs.push(address as Address);
        }
    });

    if (missingSigs.length > 0) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
            addresses: missingSigs,
        });
    }
}
