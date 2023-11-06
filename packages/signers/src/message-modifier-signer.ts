import { Address, isAddress } from '@solana/addresses';

/**
 * The response for signing a message using a {@link MessageModifierSigner}.
 * It includes the (potentially) modified message as well as its signature.
 */
export type SignedMessageResponse = {
    signature: Uint8Array;
    signedMessage: Uint8Array;
};

/** Defines a signer capable of signing messages. */
export type MessageModifierSigner<TAddress extends string = string> = {
    address: Address<TAddress>;
    modifyAndSignMessage(messages: readonly Uint8Array[]): Promise<readonly SignedMessageResponse[]>;
};

/** Checks whether the provided value implements the {@link MessageModifierSigner} interface. */
export function isMessageModifierSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): value is MessageModifierSigner<TAddress> {
    return (
        isAddress(value.address) && 'modifyAndSignMessage' in value && typeof value.modifyAndSignMessage === 'function'
    );
}

/** Asserts that the provided value implements the {@link MessageModifierSigner} interface. */
export function assertIsMessageModifierSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): asserts value is MessageModifierSigner<TAddress> {
    if (!isMessageModifierSigner(value)) {
        // TODO: Coded error.
        throw new Error('The provided value does not implement the MessageModifierSigner interface');
    }
}
