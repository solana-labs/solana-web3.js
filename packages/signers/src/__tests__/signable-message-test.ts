import '@solana/test-matchers/toBeFrozenObject';

import { TextEncoder } from '@solana/text-encoding-impl';

import { createSignableMessage } from '../signable-message';

describe('createSignableMessage', () => {
    it('creates a SignableMessage from a byte array', () => {
        // Given a byte array.
        const content = new Uint8Array([1, 2, 3]);

        // When we use it to create a new SignableMessage.
        const message = createSignableMessage(content);

        // Then we expect a message with the same content and no signatures.
        expect(message.content).toBe(content);
        expect(message.signatures).toStrictEqual({});
    });

    it('creates a SignableMessage with signatures', () => {
        // Given a byte array content and some signatures.
        const content = new Uint8Array([1, 2, 3]);
        const signatures = {
            '1111': new Uint8Array([1, 1, 1, 1]),
            '2222': new Uint8Array([2, 2, 2, 2]),
        };

        // When we create a SignableMessage using both the content and the existing signatures.
        const message = createSignableMessage(content, signatures);

        // Then we expect the message to store the provided content as-is.
        expect(message.content).toBe(content);

        // And the signatures to be copied shallowly.
        expect(message.signatures).toStrictEqual(signatures);
    });

    it('creates a SignableMessage from a UTF-8 string', () => {
        // When we create a SignableMessage by providing a string.
        const message = createSignableMessage('Hello world!');

        // Then we expect this string to be UTF-8 encoded.
        expect(message.content).toStrictEqual(new TextEncoder().encode('Hello world!'));
        expect(message.signatures).toStrictEqual({});
    });

    it('freezes the created signable message', () => {
        const message = createSignableMessage('Hello world!');
        expect(message).toBeFrozenObject();
    });

    it('freezes the empty signature directory when none is provided', () => {
        const message = createSignableMessage('Hello world!');
        expect(message.signatures).toStrictEqual({});
        expect(message.signatures).toBeFrozenObject();
    });

    it('shallow copies and freezes the provided signature directory', () => {
        // Given an existing signature directory.
        const signatures = {
            '1111': new Uint8Array([1, 1, 1, 1]),
            '2222': new Uint8Array([2, 2, 2, 2]),
        };

        // When we create a new SignableMessage using this signature directory.
        const message = createSignableMessage('Hello world!', signatures);

        // Then the signature directory is copied and frozen.
        expect(message.signatures).not.toBe(signatures);
        expect(message.signatures).toStrictEqual(signatures);
        expect(message.signatures).toBeFrozenObject();
    });
});
