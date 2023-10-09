import { address, getAddressFromPublicKey } from '@solana/addresses';
import { Ed25519Signature, generateKeyPair, signBytes } from '@solana/keys';
import { CompilableTransaction, signTransaction } from '@solana/transactions';

import {
    assertIsKeyPairSigner,
    createSignerFromKeyPair,
    generateKeyPairSigner,
    isKeyPairSigner,
    KeyPairSigner,
} from '../keypair-signer';

const getMockCryptoKeyPair = () => ({ privateKey: {}, publicKey: {} } as CryptoKeyPair);

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
    signTransaction: jest.fn(),
}));

describe('isKeyPairSigner', () => {
    it('checks whether a given value is a KeyPairSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            keyPair: getMockCryptoKeyPair(),
            address: myAddress,
            signMessage: async () => [],
            signTransaction: async () => [],
        } satisfies KeyPairSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        expect(isKeyPairSigner(mySigner)).toBe(true);
        expect(isKeyPairSigner(myAddress)).toBe(false);
        expect(isKeyPairSigner({ address: myAddress })).toBe(false);
        expect(isKeyPairSigner({ ...mySigner, signMessage: 42 })).toBe(false);
        expect(isKeyPairSigner({ ...mySigner, signTransaction: 42 })).toBe(false);
        expect(isKeyPairSigner({ ...mySigner, keyPair: 42 })).toBe(false);
    });
});

describe('assertIsKeyPairSigner', () => {
    it('asserts that a given value is a KeyPairSigner', () => {
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        const mySigner = {
            keyPair: getMockCryptoKeyPair(),
            address: myAddress,
            signMessage: async () => [],
            signTransaction: async () => [],
        } satisfies KeyPairSigner<'Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'>;

        const expectedMessage = 'The provided value does not implement the KeyPairSigner interface';
        expect(() => assertIsKeyPairSigner(mySigner)).not.toThrow();
        expect(() => assertIsKeyPairSigner(myAddress)).toThrow(expectedMessage);
        expect(() => assertIsKeyPairSigner({ address: myAddress })).toThrow(expectedMessage);
        expect(() => assertIsKeyPairSigner({ ...mySigner, signMessage: 42 })).toThrow(expectedMessage);
        expect(() => assertIsKeyPairSigner({ ...mySigner, signTransaction: 42 })).toThrow(expectedMessage);
        expect(() => assertIsKeyPairSigner({ ...mySigner, keyPair: 42 })).toThrow(expectedMessage);
    });
});

describe('createSignerFromKeyPair', () => {
    it('creates a KeyPairSigner from a given CryptoKeypair', async () => {
        // Given a mock CryptoKeyPair returning a mock address.
        const myKeyPair = getMockCryptoKeyPair();
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        jest.mocked(getAddressFromPublicKey).mockReturnValueOnce(Promise.resolve(myAddress));

        // When we create a Signer from that CryptoKeyPair.
        const mySigner = await createSignerFromKeyPair(myKeyPair);
        mySigner satisfies KeyPairSigner;

        // Then the created signer kept track of the address and key pair.
        expect(jest.mocked(getAddressFromPublicKey)).toHaveBeenCalledTimes(1);
        expect(mySigner.address).toBe(myAddress);
        expect(mySigner.keyPair).toBe(myKeyPair);

        // And provided functions to sign messages and transactions.
        expect(typeof mySigner.signMessage).toBe('function');
        expect(typeof mySigner.signTransaction).toBe('function');
    });

    it('signs messages using the signBytes function', async () => {
        // Given a KeyPairSigner created from a mock CryptoKeyPair.
        const myKeyPair = getMockCryptoKeyPair();
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        jest.mocked(getAddressFromPublicKey).mockReturnValueOnce(Promise.resolve(myAddress));
        const mySigner = await createSignerFromKeyPair(myKeyPair);

        // And given we mock the next two signatures of the signBytes function.
        const mockSignatures = [new Uint8Array([101, 101, 101]), new Uint8Array([201, 201, 201])] as Ed25519Signature[];
        jest.mocked(signBytes).mockReturnValueOnce(Promise.resolve(mockSignatures[0]));
        jest.mocked(signBytes).mockReturnValueOnce(Promise.resolve(mockSignatures[1]));

        // When we sign two messages using that signer.
        const messages = [new Uint8Array([1, 1, 1]), new Uint8Array([2, 2, 2])];
        const messageResponses = await mySigner.signMessage(messages);

        // Then the message reponses contains both the signed messages and their signatures.
        expect(messageResponses[0].signedMessage).toBe(messages[0]);
        expect(messageResponses[0].signature).toBe(mockSignatures[0]);
        expect(messageResponses[1].signedMessage).toBe(messages[1]);
        expect(messageResponses[1].signature).toBe(mockSignatures[1]);

        // And signBytes was called twice with the expected parameters.
        expect(jest.mocked(signBytes)).toHaveBeenCalledTimes(2);
        expect(jest.mocked(signBytes)).toHaveBeenNthCalledWith(1, myKeyPair.privateKey, messages[0]);
        expect(jest.mocked(signBytes)).toHaveBeenNthCalledWith(2, myKeyPair.privateKey, messages[1]);
    });

    it('signs transactions using the signTransaction function', async () => {
        // Given a KeyPairSigner created from a mock CryptoKeyPair.
        const myKeyPair = getMockCryptoKeyPair();
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        jest.mocked(getAddressFromPublicKey).mockReturnValueOnce(Promise.resolve(myAddress));
        const mySigner = await createSignerFromKeyPair(myKeyPair);

        // And given we have a couple of mock transactions to sign.
        const mockTransactions = [{} as CompilableTransaction, {} as CompilableTransaction];

        // And given we mock the next two calls of the signTransaction function.
        const mockSignatures = [new Uint8Array([101, 101, 101]), new Uint8Array([201, 201, 201])] as Ed25519Signature[];
        jest.mocked(signTransaction).mockReturnValueOnce(
            Promise.resolve({ ...mockTransactions[0], signatures: { [myAddress]: mockSignatures[0] } })
        );
        jest.mocked(signTransaction).mockReturnValueOnce(
            Promise.resolve({ ...mockTransactions[1], signatures: { [myAddress]: mockSignatures[1] } })
        );

        // When we sign both transactions using that signer.
        const signedTransactions = await mySigner.signTransaction(mockTransactions);

        // Then the returned transactions each contain a new signature.
        expect(signedTransactions[0].signatures).toStrictEqual({ [myAddress]: mockSignatures[0] });
        expect(signedTransactions[1].signatures).toStrictEqual({ [myAddress]: mockSignatures[1] });

        // And signTransaction was called twice with the expected parameters.
        expect(jest.mocked(signTransaction)).toHaveBeenCalledTimes(2);
        expect(jest.mocked(signTransaction)).toHaveBeenNthCalledWith(1, [myKeyPair], mockTransactions[0]);
        expect(jest.mocked(signTransaction)).toHaveBeenNthCalledWith(2, [myKeyPair], mockTransactions[1]);
    });
});

describe('generateKeyPairSigner', () => {
    it('generates a new KeyPairSigner using the generateKeyPair function', async () => {
        // Given we mock the return value of generateKeyPair.
        const mockKeypair = getMockCryptoKeyPair();
        jest.mocked(generateKeyPair).mockReturnValueOnce(Promise.resolve(mockKeypair));

        // And we mock the return value of getAddressFromPublicKey.
        const mockAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');
        jest.mocked(getAddressFromPublicKey).mockReturnValueOnce(Promise.resolve(mockAddress));

        // When we generate a new KeyPairSigner from scratch.
        const mySigner = await generateKeyPairSigner();
        mySigner satisfies KeyPairSigner;

        // Then the signer was created using the generated key pair and the mock address.
        expect(mySigner.keyPair).toBe(mockKeypair);
        expect(mySigner.address).toBe(mockAddress);

        // And generateKeyPair was called once.
        expect(jest.mocked(generateKeyPair)).toHaveBeenCalledTimes(1);
    });
});
