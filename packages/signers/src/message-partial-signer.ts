import { Address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_PARTIAL_SIGNER, SolanaError } from '@solana/errors';

import { SignableMessage } from './signable-message';
import { BaseSignerConfig, SignatureDictionary } from './types';

export type MessagePartialSignerConfig = BaseSignerConfig;

/** Defines a signer capable of signing messages. */
export type MessagePartialSigner<TAddress extends string = string> = Readonly<{
    address: Address<TAddress>;
    signMessages(
        messages: readonly SignableMessage[],
        config?: MessagePartialSignerConfig,
    ): Promise<readonly SignatureDictionary[]>;
}>;

/** Checks whether the provided value implements the {@link MessagePartialSigner} interface. */
export function isMessagePartialSigner<TAddress extends string>(value: {
    [key: string]: unknown;
    address: Address<TAddress>;
}): value is MessagePartialSigner<TAddress> {
    return 'signMessages' in value && typeof value.signMessages === 'function';
}

/** Asserts that the provided value implements the {@link MessagePartialSigner} interface. */
export function assertIsMessagePartialSigner<TAddress extends string>(value: {
    [key: string]: unknown;
    address: Address<TAddress>;
}): asserts value is MessagePartialSigner<TAddress> {
    if (!isMessagePartialSigner(value)) {
        throw new SolanaError(SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_PARTIAL_SIGNER, {
            address: value.address,
        });
    }
}
