import { Address } from '@solana/addresses';

/** Defines a signer capable of signing messages. */
export type MessagePartialSigner<TAddress extends string = string> = {
    address: Address<TAddress>;
    signMessage(messages: readonly Uint8Array[]): Promise<readonly Uint8Array[]>;
};

/** Checks whether the provided value implements the {@link MessagePartialSigner} interface. */
export function isMessagePartialSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): value is MessagePartialSigner<TAddress> {
    return 'signMessage' in value && typeof value.signMessage === 'function';
}

/** Asserts that the provided value implements the {@link MessagePartialSigner} interface. */
export function assertIsMessagePartialSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): asserts value is MessagePartialSigner<TAddress> {
    if (!isMessagePartialSigner(value)) {
        // TODO: Coded error.
        throw new Error('The provided value does not implement the MessagePartialSigner interface');
    }
}
