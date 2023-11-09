import { SignatureDictionary } from './types';

/** Defines a message that needs signing and its current set of signatures if any. */
export type SignableMessage = {
    content: Uint8Array;
    signatures: SignatureDictionary;
};

/** Creates a signable message from a provided content. */
export function createSignableMessage(content: Uint8Array, signatures: SignatureDictionary = {}) {
    return { content, signatures };
}
