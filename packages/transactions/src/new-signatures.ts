import { Address, getAddressFromPublicKey } from '@solana/addresses';
import { Decoder } from '@solana/codecs-core';
import { getBase58Decoder } from '@solana/codecs-strings';
import {
    SOLANA_ERROR__TRANSACTION__ADDRESSES_CANNOT_SIGN_TRANSACTION,
    SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING,
    SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING,
    SolanaError,
} from '@solana/errors';
import { Signature, SignatureBytes, signBytes } from '@solana/keys';

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

function uint8ArraysEqual(arr1: Uint8Array, arr2: Uint8Array) {
    return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
}

export async function newPartiallySignTransaction(
    keyPairs: CryptoKeyPair[],
    transaction: NewTransaction,
): Promise<NewTransaction> {
    let newSignatures: Record<Address, SignatureBytes> | undefined;
    let unexpectedSigners: Set<Address> | undefined;

    await Promise.all(
        keyPairs.map(async keyPair => {
            const address = await getAddressFromPublicKey(keyPair.publicKey);
            const existingSignature = transaction.signatures[address];

            // Check if the address is expected to sign the transaction
            if (existingSignature === undefined) {
                // address is not an expected signer for this transaction
                unexpectedSigners ||= new Set();
                unexpectedSigners.add(address);
                return;
            }

            // Return if there are any unexpected signers already since we won't be using signatures
            if (unexpectedSigners) {
                return;
            }

            const newSignature = await signBytes(keyPair.privateKey, transaction.messageBytes);

            if (existingSignature !== null && uint8ArraysEqual(newSignature, existingSignature)) {
                // already have the same signature set
                return;
            }

            newSignatures ||= {};
            newSignatures[address] = newSignature;
        }),
    );

    if (unexpectedSigners && unexpectedSigners.size > 0) {
        const expectedSigners = Object.keys(transaction.signatures);
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__ADDRESSES_CANNOT_SIGN_TRANSACTION, {
            expectedAddresses: expectedSigners,
            unexpectedAddresses: [...unexpectedSigners],
        });
    }

    if (!newSignatures) {
        return transaction;
    }

    return Object.freeze({
        ...transaction,
        signatures: Object.freeze({
            ...transaction.signatures,
            ...newSignatures,
        }),
    });
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
