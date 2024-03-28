import { Address, getAddressFromPublicKey } from '@solana/addresses';
import { Decoder } from '@solana/codecs-core';
import { getBase58Decoder } from '@solana/codecs-strings';
import {
    SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING,
    SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING,
    SolanaError,
} from '@solana/errors';
import { Signature, signBytes } from '@solana/keys';

import { NewTransaction } from './new-compile-transaction';

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

export async function newPartiallySignTransaction(
    keyPairs: CryptoKeyPair[],
    transaction: NewTransaction,
): Promise<NewTransaction> {
    const addressPrivateKeyPairs = await Promise.all(
        keyPairs.map(keyPair => Promise.all([getAddressFromPublicKey(keyPair.publicKey), keyPair.privateKey])),
    );
    const newAddressPrivateKeyPairs = addressPrivateKeyPairs.filter(
        ([address, _privateKey]) => transaction.signatures[address] === null,
    );
    const newAddressSignaturePairs = await Promise.all(
        newAddressPrivateKeyPairs.map(([address, privateKey]) =>
            Promise.all([address, signBytes(privateKey, transaction.messageBytes)]),
        ),
    );
    for (const [address, signature] of newAddressSignaturePairs) {
        transaction.signatures[address] = signature;
    }
    return Object.freeze(transaction);
}

export async function newSignTransaction(
    keyPairs: CryptoKeyPair[],
    transaction: NewTransaction,
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
