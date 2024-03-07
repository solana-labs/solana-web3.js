import { Address, isAddress } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_MODIFYING_SIGNER, SolanaError } from '@solana/errors';

import { SignableMessage } from './signable-message';
import { BaseSignerConfig } from './types';

export type MessageModifyingSignerConfig = BaseSignerConfig;

/** Defines a signer capable of signing messages. */
export type MessageModifyingSigner<TAddress extends string = string> = Readonly<{
    address: Address<TAddress>;
    modifyAndSignMessages(
        messages: readonly SignableMessage[],
        config?: MessageModifyingSignerConfig,
    ): Promise<readonly SignableMessage[]>;
}>;

/** Checks whether the provided value implements the {@link MessageModifyingSigner} interface. */
export function isMessageModifyingSigner<TAddress extends string>(value: {
    [key: string]: unknown;
    address: Address<TAddress>;
}): value is MessageModifyingSigner<TAddress> {
    return (
        isAddress(value.address) &&
        'modifyAndSignMessages' in value &&
        typeof value.modifyAndSignMessages === 'function'
    );
}

/** Asserts that the provided value implements the {@link MessageModifyingSigner} interface. */
export function assertIsMessageModifyingSigner<TAddress extends string>(value: {
    [key: string]: unknown;
    address: Address<TAddress>;
}): asserts value is MessageModifyingSigner<TAddress> {
    if (!isMessageModifyingSigner(value)) {
        throw new SolanaError(SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_MODIFYING_SIGNER, {
            address: value.address,
        });
    }
}
