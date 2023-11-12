import { Address, isAddress } from '@solana/addresses';

import { SignableMessage } from './signable-message';

/** Defines a signer capable of signing messages. */
export type MessageModifyingSigner<TAddress extends string = string> = Readonly<{
    address: Address<TAddress>;
    modifyAndSignMessages(messages: readonly SignableMessage[]): Promise<readonly SignableMessage[]>;
}>;

/** Checks whether the provided value implements the {@link MessageModifyingSigner} interface. */
export function isMessageModifyingSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): value is MessageModifyingSigner<TAddress> {
    return (
        isAddress(value.address) &&
        'modifyAndSignMessages' in value &&
        typeof value.modifyAndSignMessages === 'function'
    );
}

/** Asserts that the provided value implements the {@link MessageModifyingSigner} interface. */
export function assertIsMessageModifyingSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): asserts value is MessageModifyingSigner<TAddress> {
    if (!isMessageModifyingSigner(value)) {
        // TODO: Coded error.
        throw new Error('The provided value does not implement the MessageModifyingSigner interface');
    }
}
