import { Address, getAddressFromPublicKey } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__EXPECTED_KEY_PAIR_SIGNER, SolanaError } from '@solana/errors';
import { createKeyPairFromBytes, generateKeyPair, signBytes } from '@solana/keys';
import { partiallySignTransaction } from '@solana/transactions';

import { isMessagePartialSigner, MessagePartialSigner } from './message-partial-signer';
import { isTransactionPartialSigner, TransactionPartialSigner } from './transaction-partial-signer';

/** Defines a signer capable of signing messages and transactions using a CryptoKeyPair. */
export type KeyPairSigner<TAddress extends string = string> = MessagePartialSigner<TAddress> &
    TransactionPartialSigner<TAddress> & { keyPair: CryptoKeyPair };

/** Checks whether the provided value implements the {@link KeyPairSigner} interface. */
export function isKeyPairSigner<TAddress extends string>(value: {
    [key: string]: unknown;
    address: Address<TAddress>;
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
    [key: string]: unknown;
    address: Address<TAddress>;
}): asserts value is KeyPairSigner<TAddress> {
    if (!isKeyPairSigner(value)) {
        throw new SolanaError(SOLANA_ERROR__SIGNER__EXPECTED_KEY_PAIR_SIGNER, {
            address: value.address,
        });
    }
}

/** Creates a KeyPairSigner from the provided Crypto KeyPair. */
export async function createSignerFromKeyPair(keyPair: CryptoKeyPair): Promise<KeyPairSigner> {
    const address = await getAddressFromPublicKey(keyPair.publicKey);
    const out: KeyPairSigner = {
        address,
        keyPair,
        signMessages: messages =>
            Promise.all(
                messages.map(async message =>
                    Object.freeze({ [address]: await signBytes(keyPair.privateKey, message.content) }),
                ),
            ),
        signTransactions: transactions =>
            Promise.all(
                transactions.map(async transaction => {
                    const signedTransaction = await partiallySignTransaction([keyPair], transaction);
                    return Object.freeze({ [address]: signedTransaction.signatures[address] });
                }),
            ),
    };

    return Object.freeze(out);
}

/** Securely generates a signer capable of signing messages and transactions using a Crypto KeyPair. */
export async function generateKeyPairSigner(): Promise<KeyPairSigner> {
    return await createSignerFromKeyPair(await generateKeyPair());
}

/** Creates a signer capable of signing messages and transactions using the 64 bytes of a KeyPair. */
export async function createKeyPairSignerFromBytes(bytes: Uint8Array, extractable?: boolean): Promise<KeyPairSigner> {
    return await createSignerFromKeyPair(await createKeyPairFromBytes(bytes, extractable));
}
