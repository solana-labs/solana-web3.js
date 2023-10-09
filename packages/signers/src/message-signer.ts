import { Base58EncodedAddress, isAddress } from '@solana/addresses';

/**
 * The response for signing a message.
 * It includes the signature as well as the message that was actually used for signing.
 * In most cases, the `signedMessaged` will be the same as the original message but
 * sometimes, the original message may need to be modified before being signed.
 */
export type SignedMessageResponse = {
    signature: Uint8Array;
    signedMessage: Uint8Array;
};

/** Defines a signer capable of signing messages. */
export type MessageSigner<TAddress extends string = string> = {
    address: Base58EncodedAddress<TAddress>;
    signMessage(messages: ReadonlyArray<Uint8Array>): Promise<ReadonlyArray<SignedMessageResponse>>;
};

/** Checks whether the provided value implements the {@link MessageSigner} interface. */
export function isMessageSigner<TAddress extends string>(value: {
    address: Base58EncodedAddress<TAddress>;
}): value is MessageSigner<TAddress>;
export function isMessageSigner(value: unknown): value is MessageSigner;
export function isMessageSigner(value: unknown): value is MessageSigner {
    return (
        !!value &&
        typeof value === 'object' &&
        'address' in value &&
        typeof value.address === 'string' &&
        isAddress(value.address) &&
        'signMessage' in value &&
        typeof value.signMessage === 'function'
    );
}

/** Asserts that the provided value implements the {@link MessageSigner} interface. */
export function assertIsMessageSigner<TAddress extends string>(value: {
    address: Base58EncodedAddress<TAddress>;
}): asserts value is MessageSigner<TAddress>;
export function assertIsMessageSigner(value: unknown): asserts value is MessageSigner;
export function assertIsMessageSigner(value: unknown): asserts value is MessageSigner {
    if (!isMessageSigner(value)) {
        // TODO: Coded error.
        throw new Error('The provided value does not implement the MessageSigner interface');
    }
}
