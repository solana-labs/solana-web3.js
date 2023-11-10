import { Address, getAddressFromPublicKey } from '@solana/addresses';
import { Decoder } from '@solana/codecs-core';
import { getBase58Decoder } from '@solana/codecs-strings';
import { isSignerRole } from '@solana/instructions';
import { Signature, SignatureBytes, signBytes } from '@solana/keys';

import { CompilableTransaction } from './compilable-transaction';
import { ITransactionWithFeePayer } from './fee-payer';
import { compileMessage } from './message';
import { getCompiledMessageEncoder } from './serializers/message';

export interface IFullySignedTransaction extends ITransactionWithSignatures {
    readonly __brand: unique symbol;
}
export interface ITransactionWithSignatures {
    readonly signatures: Readonly<Record<Address, SignatureBytes>>;
}

let base58Decoder: Decoder<string> | undefined;

export function getSignatureFromTransaction(
    transaction: ITransactionWithFeePayer & ITransactionWithSignatures
): Signature {
    if (!base58Decoder) base58Decoder = getBase58Decoder();

    const signatureBytes = transaction.signatures[transaction.feePayer];
    if (!signatureBytes) {
        // TODO: Coded error.
        throw new Error(
            "Could not determine this transaction's signature. Make sure that the transaction " +
                'has been signed by its fee payer.'
        );
    }
    const transactionSignature = base58Decoder.decode(signatureBytes)[0];
    return transactionSignature as Signature;
}

export async function partiallySignTransaction<TTransaction extends CompilableTransaction>(
    keyPairs: CryptoKeyPair[],
    transaction: TTransaction | (TTransaction & ITransactionWithSignatures)
): Promise<TTransaction & ITransactionWithSignatures> {
    const compiledMessage = compileMessage(transaction);
    const nextSignatures: Record<Address, SignatureBytes> =
        'signatures' in transaction ? { ...transaction.signatures } : {};
    const wireMessageBytes = getCompiledMessageEncoder().encode(compiledMessage);
    const publicKeySignaturePairs = await Promise.all(
        keyPairs.map(keyPair =>
            Promise.all([getAddressFromPublicKey(keyPair.publicKey), signBytes(keyPair.privateKey, wireMessageBytes)])
        )
    );
    for (const [signerPublicKey, signature] of publicKeySignaturePairs) {
        nextSignatures[signerPublicKey] = signature;
    }
    const out = {
        ...transaction,
        signatures: nextSignatures,
    };
    Object.freeze(out);
    return out;
}

export async function signTransaction<TTransaction extends CompilableTransaction>(
    keyPairs: CryptoKeyPair[],
    transaction: TTransaction | (TTransaction & ITransactionWithSignatures)
): Promise<TTransaction & IFullySignedTransaction> {
    const out = await partiallySignTransaction(keyPairs, transaction);
    assertTransactionIsFullySigned(out);
    Object.freeze(out);
    return out;
}

export function assertTransactionIsFullySigned<TTransaction extends CompilableTransaction>(
    transaction: TTransaction & ITransactionWithSignatures
): asserts transaction is TTransaction & IFullySignedTransaction {
    const signerAddressesFromInstructions = transaction.instructions
        .flatMap(i => i.accounts?.filter(a => isSignerRole(a.role)) ?? [])
        .map(a => a.address);
    const requiredSigners = new Set([transaction.feePayer, ...signerAddressesFromInstructions]);

    requiredSigners.forEach(address => {
        if (!transaction.signatures[address]) {
            // TODO coded error
            throw new Error(`Transaction is missing signature for address \`${address}\``);
        }
    });
}
