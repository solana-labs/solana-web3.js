import { Address } from '@solana/addresses';

import { isMessageModifyingSigner, MessageModifyingSigner } from './message-modifying-signer';
import { isMessagePartialSigner, MessagePartialSigner } from './message-partial-signer';

/** Defines a signer capable of signing messages. */
export type MessageSigner<TAddress extends string = string> =
    | MessagePartialSigner<TAddress>
    | MessageModifyingSigner<TAddress>;

/** Checks whether the provided value implements the {@link MessageSigner} interface. */
export function isMessageSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): value is MessageSigner<TAddress> {
    return isMessagePartialSigner(value) || isMessageModifyingSigner(value);
}

/** Asserts that the provided value implements the {@link MessageSigner} interface. */
export function assertIsMessageSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): asserts value is MessageSigner<TAddress> {
    if (!isMessageSigner(value)) {
        // TODO: Coded error.
        throw new Error('The provided value does not implement any of the MessageSigner interfaces');
    }
}
