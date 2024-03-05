import { Address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_SIGNER, SolanaError } from '@solana/errors';

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
        throw new SolanaError(SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_SIGNER, {
            address: value.address,
        });
    }
}
