import { Base58EncodedAddress, getAddressFromPublicKey } from '@solana/addresses';
import { generateKeyPair, signBytes } from '@solana/keys';
import { CompilableTransaction, ITransactionWithSignatures, signTransaction } from '@solana/transactions';

import { MessageSigner, SignedMessageResponse, isMessageSigner } from './message-signer';
import { TransactionSigner, isTransactionSigner } from './transaction-signer';

/** Defines a signer capable of signing messages and transactions using a Crypto KeyPair. */
export type KeyPairSigner<TAddress extends string = string> = MessageSigner<TAddress> &
    TransactionSigner<TAddress> & { keyPair: CryptoKeyPair };

/** Checks whether the provided value implements the {@link KeyPairSigner} interface. */
export function isKeyPairSigner<TAddress extends string>(value: {
    address: Base58EncodedAddress<TAddress>;
}): value is KeyPairSigner<TAddress>;
export function isKeyPairSigner(value: unknown): value is KeyPairSigner;
export function isKeyPairSigner(value: unknown): value is KeyPairSigner {
    return (
        !!value &&
        typeof value === 'object' &&
        'keyPair' in value &&
        typeof value.keyPair === 'object' &&
        isMessageSigner(value) &&
        isTransactionSigner(value)
    );
}

/** Asserts that the provided value implements the {@link KeyPairSigner} interface. */
export function assertIsKeyPairSigner<TAddress extends string>(value: {
    address: Base58EncodedAddress<TAddress>;
}): asserts value is KeyPairSigner<TAddress>;
export function assertIsKeyPairSigner(value: unknown): asserts value is KeyPairSigner;
export function assertIsKeyPairSigner(value: unknown): asserts value is KeyPairSigner {
    if (!isKeyPairSigner(value)) {
        // TODO: Coded error.
        throw new Error('The provided value does not implement the KeyPairSigner interface');
    }
}

/** Creates a KeyPairSigner from the provided Crypto KeyPair. */
export async function createSignerFromKeyPair(keyPair: CryptoKeyPair): Promise<KeyPairSigner> {
    return {
        keyPair,
        address: await getAddressFromPublicKey(keyPair.publicKey),
        signMessage: async (messages: ReadonlyArray<Uint8Array>): Promise<ReadonlyArray<SignedMessageResponse>> => {
            return Promise.all(
                messages.map(async message => ({
                    signature: await signBytes(keyPair.privateKey, message),
                    signedMessage: message,
                }))
            );
        },
        signTransaction: async <TTransaction extends CompilableTransaction>(
            transactions: ReadonlyArray<TTransaction>
        ): Promise<ReadonlyArray<TTransaction & ITransactionWithSignatures>> => {
            return Promise.all(transactions.map(transaction => signTransaction([keyPair], transaction)));
        },
    };
}

/** Securely generates a signer capable of signing messages and transactions using a Crypto KeyPair. */
export async function generateKeyPairSigner(): Promise<KeyPairSigner> {
    return createSignerFromKeyPair(await generateKeyPair());
}
