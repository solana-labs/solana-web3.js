import { Address, getAddressFromPublicKey } from '@solana/addresses';
import { generateKeyPair, signBytes } from '@solana/keys';
import { signTransaction } from '@solana/transactions';

import { isMessagePartialSigner, MessagePartialSigner } from './message-partial-signer';
import { isTransactionPartialSigner, TransactionPartialSigner } from './transaction-partial-signer';

/** Defines a signer capable of signing messages and transactions using a Crypto KeyPair. */
export type KeyPairSigner<TAddress extends string = string> = MessagePartialSigner<TAddress> &
    TransactionPartialSigner<TAddress> & { keyPair: CryptoKeyPair };

/** Checks whether the provided value implements the {@link KeyPairSigner} interface. */
export function isKeyPairSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): value is KeyPairSigner<TAddress> {
    return (
        'keyPair' in value &&
        typeof value.keyPair === 'object' &&
        isMessagePartialSigner(value) &&
        isTransactionPartialSigner(value)
    );
}

/** Asserts that the provided value implements the {@link KeyPairSigner} interface. */
export function assertIsKeyPairSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): asserts value is KeyPairSigner<TAddress> {
    if (!isKeyPairSigner(value)) {
        // TODO: Coded error.
        throw new Error('The provided value does not implement the KeyPairSigner interface');
    }
}

/** Creates a KeyPairSigner from the provided Crypto KeyPair. */
export async function createSignerFromKeyPair(keyPair: CryptoKeyPair): Promise<KeyPairSigner> {
    const address = await getAddressFromPublicKey(keyPair.publicKey);
    return {
        address,
        keyPair,
        signMessage: messages =>
            Promise.all(
                messages.map(async message => ({
                    [address]: await signBytes(keyPair.privateKey, message),
                }))
            ),
        signTransaction: transactions =>
            Promise.all(
                transactions.map(async transaction => {
                    const signedTransaction = await signTransaction([keyPair], transaction);
                    return { [address]: signedTransaction.signatures[address] };
                })
            ),
    };
}

/** Securely generates a signer capable of signing messages and transactions using a Crypto KeyPair. */
export async function generateKeyPairSigner(): Promise<KeyPairSigner> {
    return createSignerFromKeyPair(await generateKeyPair());
}
