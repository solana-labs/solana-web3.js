import { TextEncoder } from '@solana/text-encoding-impl';

import { SignatureDictionary } from './types';

/** Defines a message that needs signing and its current set of signatures if any. */
export type SignableMessage = Readonly<{
    content: Uint8Array;
    signatures: SignatureDictionary;
}>;

/**
 * Creates a signable message from a provided content.
 * If a string is provided, it will be UTF-8 encoded.
 */
export function createSignableMessage(
    content: Uint8Array | string,
    signatures: SignatureDictionary = {},
): SignableMessage {
    return Object.freeze({
        content: typeof content === 'string' ? new TextEncoder().encode(content) : content,
        signatures: Object.freeze({ ...signatures }),
    });
}
