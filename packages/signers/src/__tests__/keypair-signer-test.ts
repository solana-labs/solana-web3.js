import '@solana/test-matchers/toBeFrozenObject';

import { address, getAddressFromPublicKey } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__EXPECTED_KEY_PAIR_SIGNER, SolanaError } from '@solana/errors';
import { generateKeyPair, SignatureBytes, signBytes } from '@solana/keys';
import { CompilableTransaction, partiallySignTransaction } from '@solana/transactions';

import {
    assertIsKeyPairSigner,
    createSignerFromKeyPair,
    generateKeyPairSigner,
    isKeyPairSigner,
    KeyPairSigner,
} from '../keypair-signer';
import { createSignableMessage } from '../signable-message';

const getMockCryptoKeyPair = () => ({ privateKey: {}, publicKey: {} }) as CryptoKeyPair;

// Partial mocks.
jest.mock('@solana/addresses', () => ({
    ...jest.requireActual('@solana/addresses'),
    getAddressFromPublicKey: jest.fn(),
}));
jest.mock('@solana/keys', () => ({
    ...jest.requireActual('@solana/keys'),
    generateKeyPair: jest.fn(),
    signBytes: jest.fn(),
}));
jest.mock('@solana/transactions', () => ({
    ...jest.requireActual('@solana/transactions'),
    partiallySignTransaction: jest.fn(),
}));

describe('isKeyPairSigner', () => {
    it('checks whether a given value is a KeyPairSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            keyPair: getMockCryptoKeyPair(),
            signMessages: () => Promise.resolve([]),
            signTransactions: () => Promise.resolve([]),
        } satisfies KeyPairSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        expect(isKeyPairSigner(mySigner)).toBe(true);
        expect(isKeyPairSigner({ address: myAddress })).toBe(false);
        expect(isKeyPairSigner({ ...mySigner, signMessages: 42 })).toBe(false);
        expect(isKeyPairSigner({ ...mySigner, signTransactions: 42 })).toBe(false);
        expect(isKeyPairSigner({ ...mySigner, keyPair: 42 })).toBe(false);
    });
});

describe('assertIsKeyPairSigner', () => {
    it('asserts that a given value is a KeyPairSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            address: myAddress,
            keyPair: getMockCryptoKeyPair(),
            signMessages: () => Promise.resolve([]),
            signTransactions: () => Promise.resolve([]),
        } satisfies KeyPairSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedError = new SolanaError(SOLANA_ERROR__SIGNER__EXPECTED_KEY_PAIR_SIGNER, {
            address: myAddress,
        });
        expect(() => assertIsKeyPairSigner(mySigner)).not.toThrow();
        expect(() => assertIsKeyPairSigner({ address: myAddress })).toThrow(expectedError);
        expect(() => assertIsKeyPairSigner({ ...mySigner, signMessages: 42 })).toThrow(expectedError);
        expect(() => assertIsKeyPairSigner({ ...mySigner, signTransactions: 42 })).toThrow(expectedError);
        expect(() => assertIsKeyPairSigner({ ...mySigner, keyPair: 42 })).toThrow(expectedError);
    });
});

describe('createSignerFromKeyPair', () => {
    it('creates a KeyPairSigner from a given CryptoKeypair', async () => {
        expect.assertions(5);

        // Given a mock CryptoKeyPair returning a mock address.
        const myKeyPair = getMockCryptoKeyPair();
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        jest.mocked(getAddressFromPublicKey).mockResolvedValueOnce(myAddress);

        // When we create a Signer from that CryptoKeyPair.
        const mySigner = await createSignerFromKeyPair(myKeyPair);
        mySigner satisfies KeyPairSigner;

        // Then the created signer kept track of the address and key pair.
        expect(jest.mocked(getAddressFromPublicKey)).toHaveBeenCalledTimes(1);
        expect(mySigner.address).toBe(myAddress);
        expect(mySigner.keyPair).toBe(myKeyPair);

        // And provided functions to sign messages and transactions.
        expect(typeof mySigner.signMessages).toBe('function');
        expect(typeof mySigner.signTransactions).toBe('function');
    });

    it('freezes the created signer', async () => {
        expect.assertions(1);
        const mySigner = await createSignerFromKeyPair(getMockCryptoKeyPair());
        expect(mySigner).toBeFrozenObject();
    });

    it('signs messages using the signBytes function', async () => {
        expect.assertions(7);

        // Given a KeyPairSigner created from a mock CryptoKeyPair.
        const myKeyPair = getMockCryptoKeyPair();
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        jest.mocked(getAddressFromPublicKey).mockResolvedValueOnce(myAddress);
        const mySigner = await createSignerFromKeyPair(myKeyPair);

        // And given we mock the next two signatures of the signBytes function.
        const mockSignatures = [new Uint8Array([101, 101, 101]), new Uint8Array([201, 201, 201])] as SignatureBytes[];
        jest.mocked(signBytes).mockResolvedValueOnce(mockSignatures[0]);
        jest.mocked(signBytes).mockResolvedValueOnce(mockSignatures[1]);

        // When we sign two messages using that signer.
        const messages = [
            createSignableMessage(new Uint8Array([1, 1, 1])),
            createSignableMessage(new Uint8Array([2, 2, 2])),
        ];
        const signatureDictionaries = await mySigner.signMessages(messages);

        // Then the signature directories contain the expected signatures.
        expect(signatureDictionaries[0]).toStrictEqual({ [myAddress]: mockSignatures[0] });
        expect(signatureDictionaries[1]).toStrictEqual({ [myAddress]: mockSignatures[1] });

        // And the signature directories are frozen.
        expect(signatureDictionaries[0]).toBeFrozenObject();
        expect(signatureDictionaries[1]).toBeFrozenObject();

        // And signBytes was called twice with the expected parameters.
        expect(jest.mocked(signBytes)).toHaveBeenCalledTimes(2);
        expect(jest.mocked(signBytes)).toHaveBeenNthCalledWith(1, myKeyPair.privateKey, messages[0].content);
        expect(jest.mocked(signBytes)).toHaveBeenNthCalledWith(2, myKeyPair.privateKey, messages[1].content);
    });

    it('signs transactions using the signTransactions function', async () => {
        expect.assertions(7);

        // Given a KeyPairSigner created from a mock CryptoKeyPair.
        const myKeyPair = getMockCryptoKeyPair();
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        jest.mocked(getAddressFromPublicKey).mockResolvedValueOnce(myAddress);
        const mySigner = await createSignerFromKeyPair(myKeyPair);

        // And given we have a couple of mock transactions to sign.
        const mockTransactions = [{} as CompilableTransaction, {} as CompilableTransaction];

        // And given we mock the next two calls of the partiallySignTransaction function.
        const mockSignatures = [new Uint8Array([101, 101, 101]), new Uint8Array([201, 201, 201])] as SignatureBytes[];
        jest.mocked(partiallySignTransaction).mockResolvedValueOnce({
            ...mockTransactions[0],
            signatures: { [myAddress]: mockSignatures[0] },
        });
        jest.mocked(partiallySignTransaction).mockResolvedValueOnce({
            ...mockTransactions[1],
            signatures: { [myAddress]: mockSignatures[1] },
        });

        // When we sign both transactions using that signer.
        const signatureDictionaries = await mySigner.signTransactions(mockTransactions);

        // Then the signature directories contain the expected signatures.
        expect(signatureDictionaries[0]).toStrictEqual({ [myAddress]: mockSignatures[0] });
        expect(signatureDictionaries[1]).toStrictEqual({ [myAddress]: mockSignatures[1] });

        // And the signature directories are frozen.
        expect(signatureDictionaries[0]).toBeFrozenObject();
        expect(signatureDictionaries[1]).toBeFrozenObject();

        // And partiallySignTransaction was called twice with the expected parameters.
        expect(jest.mocked(partiallySignTransaction)).toHaveBeenCalledTimes(2);
        expect(jest.mocked(partiallySignTransaction)).toHaveBeenNthCalledWith(1, [myKeyPair], mockTransactions[0]);
        expect(jest.mocked(partiallySignTransaction)).toHaveBeenNthCalledWith(2, [myKeyPair], mockTransactions[1]);
    });
});

describe('generateKeyPairSigner', () => {
    it('generates a new KeyPairSigner using the generateKeyPair function', async () => {
        expect.assertions(3);

        // Given we mock the return value of generateKeyPair.
        const mockKeypair = getMockCryptoKeyPair();
        jest.mocked(generateKeyPair).mockResolvedValueOnce(mockKeypair);

        // And we mock the return value of getAddressFromPublicKey.
        const mockAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        jest.mocked(getAddressFromPublicKey).mockResolvedValueOnce(mockAddress);

        // When we generate a new KeyPairSigner from scratch.
        const mySigner = await generateKeyPairSigner();
        mySigner satisfies KeyPairSigner;

        // Then the signer was created using the generated key pair and the mock address.
        expect(mySigner.keyPair).toBe(mockKeypair);
        expect(mySigner.address).toBe(mockAddress);

        // And generateKeyPair was called once.
        expect(jest.mocked(generateKeyPair)).toHaveBeenCalledTimes(1);
    });

    it('freezes the generated signer', async () => {
        expect.assertions(1);

        // Given we mock the return value of generateKeyPair.
        const mockKeypair = getMockCryptoKeyPair();
        jest.mocked(generateKeyPair).mockResolvedValueOnce(mockKeypair);

        // Then the generated signer is frozen.
        const mySigner = await generateKeyPairSigner();
        expect(mySigner).toBeFrozenObject();
    });
});
