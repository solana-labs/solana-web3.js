import 'test-matchers/toBeFrozenObject';

import { Base58EncodedAddress, getAddressFromPublicKey, getBase58EncodedAddressCodec } from '@solana/addresses';
import { signBytes } from '@solana/keys';

import { Blockhash } from '../blockhash';
import { CompiledMessage, compileMessage } from '../message';
import { signTransaction } from '../signatures';

jest.mock('@solana/addresses');
jest.mock('@solana/keys');
jest.mock('../message');

describe('signTransaction', () => {
    const MOCK_TRANSACTION = {} as unknown as Parameters<typeof signTransaction>[1];
    const MOCK_SIGNATURE_A = new Uint8Array(Array(64).fill(1));
    const MOCK_SIGNATURE_B = new Uint8Array(Array(64).fill(2));
    const MOCK_SIGNATURE_C = new Uint8Array(Array(64).fill(3));
    const mockKeyPairA = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockKeyPairB = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockKeyPairC = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockPublicKeyAddressA =
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as Base58EncodedAddress<'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'>;
    const mockPublicKeyAddressB =
        'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' as Base58EncodedAddress<'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'>;
    const mockPublicKeyAddressC =
        'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC' as Base58EncodedAddress<'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC'>;
    beforeEach(async () => {
        (compileMessage as jest.Mock).mockReturnValue({
            header: {
                numReadonlyNonSignerAccounts: 2,
                numReadonlySignerAccounts: 1,
                numSignerAccounts: 2,
            },
            instructions: [
                {
                    accountIndices: [/* mockPublicKeyAddressB */ 1, /* mockPublicKeyAddressC */ 2],
                    programAddressIndex: 3 /* system program */,
                },
            ],
            lifetimeToken: 'fBrpLg4qfyVH8e3z4zbjAXy4kCZP2jCFdqy113vndcj' as Blockhash,
            staticAccounts: [
                /* 0: fee payer */ mockPublicKeyAddressA,
                /* 1: read-only instruction signer address */ mockPublicKeyAddressB,
                /* 2: readonly address */ mockPublicKeyAddressC,
                /* 3: system program */ '11111111111111111111111111111111' as Base58EncodedAddress<'11111111111111111111111111111111'>,
            ],
            version: 0,
        } as CompiledMessage);
        (getAddressFromPublicKey as jest.Mock).mockImplementation(async publicKey => {
            switch (publicKey) {
                case mockKeyPairA.publicKey:
                    return mockPublicKeyAddressA;
                case mockKeyPairB.publicKey:
                    return mockPublicKeyAddressB;
                case mockKeyPairC.publicKey:
                    return mockPublicKeyAddressC;
                default:
                    return '99999999999999999999999999999999' as Base58EncodedAddress<'99999999999999999999999999999999'>;
            }
        });
        (getBase58EncodedAddressCodec as jest.Mock).mockReturnValue({
            serialize: jest.fn().mockReturnValue('fAkEbAsE58AdDrEsS'),
        });
        (signBytes as jest.Mock).mockImplementation(async secretKey => {
            switch (secretKey) {
                case mockKeyPairA.privateKey:
                    return MOCK_SIGNATURE_A;
                case mockKeyPairB.privateKey:
                    return MOCK_SIGNATURE_B;
                case mockKeyPairC.privateKey:
                    return MOCK_SIGNATURE_C;
                default:
                    return new Uint8Array(Array(64).fill(0xff));
            }
        });
    });
    it("returns a transaction object having the first signer's signature", async () => {
        expect.assertions(1);
        const partiallySignedTransactionPromise = signTransaction([mockKeyPairA], MOCK_TRANSACTION);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({ [mockPublicKeyAddressA]: MOCK_SIGNATURE_A })
        );
    });
    it("returns a transaction object having the second signer's signature", async () => {
        expect.assertions(1);
        const partiallySignedTransactionPromise = signTransaction([mockKeyPairB], MOCK_TRANSACTION);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({ [mockPublicKeyAddressB]: MOCK_SIGNATURE_B })
        );
    });
    it('returns a transaction object having multiple signatures', async () => {
        expect.assertions(1);
        const partiallySignedTransactionPromise = signTransaction(
            [mockKeyPairA, mockKeyPairB, mockKeyPairC],
            MOCK_TRANSACTION
        );
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({
                [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
                [mockPublicKeyAddressB]: MOCK_SIGNATURE_B,
                [mockPublicKeyAddressC]: MOCK_SIGNATURE_C,
            })
        );
    });
    it('returns a transaction object without overwriting the existing signatures', async () => {
        expect.assertions(1);
        const mockTransactionWithSignatureForSignerA = {
            ...MOCK_TRANSACTION,
            signatures: { [mockPublicKeyAddressB]: MOCK_SIGNATURE_B },
        };
        const partiallySignedTransactionPromise = signTransaction(
            [mockKeyPairA],
            mockTransactionWithSignatureForSignerA
        );
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({
                [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
                [mockPublicKeyAddressB]: MOCK_SIGNATURE_B,
            })
        );
    });
    it("does not mutate the original signatures when updating a transaction's signatures", async () => {
        expect.assertions(2);
        const startingSignatures = { [mockPublicKeyAddressB]: MOCK_SIGNATURE_B } as const;
        const mockTransactionWithSignatureForSignerA = {
            ...MOCK_TRANSACTION,
            signatures: startingSignatures,
        };
        const { signatures } = await signTransaction([mockKeyPairA], mockTransactionWithSignatureForSignerA);
        expect(signatures).not.toBe(startingSignatures);
        expect(signatures).toMatchObject({
            [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
            [mockPublicKeyAddressB]: MOCK_SIGNATURE_B,
        });
    });
    it("does not mutate the original signatures when updating a transaction's signatures with multiple signers", async () => {
        expect.assertions(2);
        const startingSignatures = { [mockPublicKeyAddressB]: MOCK_SIGNATURE_B } as const;
        const mockTransactionWithSignatureForSignerA = {
            ...MOCK_TRANSACTION,
            signatures: startingSignatures,
        };
        const { signatures } = await signTransaction(
            [mockKeyPairA, mockKeyPairC],
            mockTransactionWithSignatureForSignerA
        );
        expect(signatures).not.toBe(startingSignatures);
        expect(signatures).toMatchObject({
            [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
            [mockPublicKeyAddressB]: MOCK_SIGNATURE_B,
            [mockPublicKeyAddressC]: MOCK_SIGNATURE_C,
        });
    });
    it('freezes the object', async () => {
        expect.assertions(1);
        await expect(signTransaction([mockKeyPairA], MOCK_TRANSACTION)).resolves.toBeFrozenObject();
    });
});
