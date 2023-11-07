import 'test-matchers/toBeFrozenObject';

import {
    Address,
    getAddressCodec,
    getAddressDecoder,
    getAddressEncoder,
    getAddressFromPublicKey,
} from '@solana/addresses';
import { Encoder } from '@solana/codecs-core';
import { getBase58Encoder } from '@solana/codecs-strings';
import { AccountRole } from '@solana/instructions';
import { Ed25519Signature, signBytes } from '@solana/keys';

import { Blockhash } from '../blockhash';
import { CompilableTransaction } from '../compilable-transaction';
import { CompiledMessage, compileMessage } from '../message';
import {
    assertTransactionIsFullySigned,
    getSignatureFromTransaction,
    ITransactionWithSignatures,
    signTransaction,
} from '../signatures';

jest.mock('@solana/addresses');
jest.mock('@solana/keys');
jest.mock('../message');
jest.mock('@solana/codecs-strings', () => ({
    ...jest.requireActual('@solana/codecs-strings'),
    getBase58Encoder: jest.fn(),
}));

// real implementations
const originalBase58Module = jest.requireActual('@solana/codecs-strings');
const originalGetBase58Encoder = originalBase58Module.getBase58Encoder();

describe('assertIsTransactionSignature()', () => {
    let assertIsTransactionSignature: typeof import('../signatures').assertIsTransactionSignature;
    // Reload `assertIsTransactionSignature` before each test to reset memoized state
    beforeEach(async () => {
        await jest.isolateModulesAsync(async () => {
            const base58ModulePromise =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                import('../signatures');
            assertIsTransactionSignature = (await base58ModulePromise).assertIsTransactionSignature;
        });
    });

    describe('using the real base58 implementation', () => {
        beforeEach(() => {
            // use real implementation
            jest.mocked(getBase58Encoder).mockReturnValue(originalGetBase58Encoder);
        });

        it('throws when supplied a non-base58 string', () => {
            expect(() => {
                assertIsTransactionSignature('not-a-base-58-encoded-string');
            }).toThrow();
        });
        it('throws when the decoded byte array has a length other than 32 bytes', () => {
            expect(() => {
                assertIsTransactionSignature(
                    // 63 bytes [128, ..., 128]
                    '1'.repeat(63)
                );
            }).toThrow();
        });
        it('does not throw when supplied a base-58 encoded signature', () => {
            expect(() => {
                // 64 bytes [0, ..., 0]
                assertIsTransactionSignature('1'.repeat(64));

                // example signatures
                assertIsTransactionSignature(
                    '5HkW5GttYoahVHaujuxEyfyq7RwvoKpc94ko5Fq9GuYdyhejg9cHcqm1MjEvHsjaADRe6hVBqB2E4RQgGgxeA2su'
                );
                assertIsTransactionSignature(
                    '2VZm7DkqSKaHxsGiAuVuSkvEbGWf7JrfRdPTw42WKuJC8qw7yQbGL5AE7UxHH3tprgmT9EVbambnK9h3PLpvMvES'
                );
                assertIsTransactionSignature(
                    '5sXRtm61WrRGRTjJ6f2anKUWt86Y4V9gWU4WUpue4T4Zh6zuvFoSyaX5LkEtChfqVC8oHdqLo2eUXbhVduThBdfG'
                );
                assertIsTransactionSignature(
                    '2Dy6Qai5JyChoP4BKoh9KAYhpD96CUhmEce1GJ8HpV5h8Q4CgUt8KZQzhVNDEQYcjARxYyBNhNjhKUGC2XLZtCCm'
                );
            }).not.toThrow();
        });
        it('returns undefined when supplied a base-58 encoded signature', () => {
            // 64 bytes [0, ..., 0]
            expect(assertIsTransactionSignature('1'.repeat(64))).toBeUndefined();
        });
    });

    describe('using a mock base58 implementation', () => {
        const mockEncode = jest.fn();
        beforeEach(() => {
            // use mock implementation
            mockEncode.mockClear();
            jest.mocked(getBase58Encoder).mockReturnValue({ encode: mockEncode } as unknown as Encoder<string>);
        });
        [64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88].forEach(
            len => {
                it(`attempts to decode input strings of exactly ${len} characters`, () => {
                    try {
                        assertIsTransactionSignature('1'.repeat(len));
                        // eslint-disable-next-line no-empty
                    } catch {}
                    expect(mockEncode).toHaveBeenCalledTimes(1);
                });
            }
        );
        it('does not attempt to decode too-short input strings', () => {
            try {
                assertIsTransactionSignature(
                    // 63 bytes [0, ..., 0]
                    '1'.repeat(63)
                );
                // eslint-disable-next-line no-empty
            } catch {}
            expect(mockEncode).not.toHaveBeenCalled();
        });
        it('does not attempt to decode too-long input strings', () => {
            try {
                assertIsTransactionSignature(
                    // 65 bytes [0, 255, ..., 255]
                    '167rpwLCuS5DGA8KGZXKsVQ7dnPb9goRLoKfgGbLfQg9WoLUgNY77E2jT11fem3coV9nAkguBACzrU1iyZM4B8roQ'
                );
                // eslint-disable-next-line no-empty
            } catch {}
            expect(mockEncode).not.toHaveBeenCalled();
        });
        it('memoizes getBase58Encoder when called multiple times', () => {
            try {
                assertIsTransactionSignature('1'.repeat(64));
                // eslint-disable-next-line no-empty
            } catch {}
            try {
                assertIsTransactionSignature('1'.repeat(64));
                // eslint-disable-next-line no-empty
            } catch {}
            expect(jest.mocked(getBase58Encoder)).toHaveBeenCalledTimes(1);
        });
    });
});

describe('getSignatureFromTransaction', () => {
    it("returns the signature associated with a transaction's fee payer", () => {
        const transactionWithoutFeePayerSignature = {
            feePayer: '123' as Address,
            signatures: {
                ['123' as Address]: new Uint8Array(new Array(64).fill(9)) as Ed25519Signature,
            } as const,
        };
        expect(getSignatureFromTransaction(transactionWithoutFeePayerSignature)).toBe(
            'BUguQsv2ZuHus54HAFzjdJHzZBkygAjKhEeYwSG19tUfUyvvz3worsdQCdAXDNjakJHioSiyxhFiDJrm8XpSXRA'
        );
    });
    it('throws when supplied a transaction that has not been signed by the fee payer', () => {
        const transactionWithoutFeePayerSignature = {
            feePayer: '123' as Address,
            signatures: {
                // No signature by the fee payer.
                ['456' as Address]: new Uint8Array(new Array(64).fill(9)) as Ed25519Signature,
            } as const,
        };
        expect(() => {
            getSignatureFromTransaction(transactionWithoutFeePayerSignature);
        }).toThrow(
            "Could not determine this transaction's signature. Make sure that the transaction " +
                'has been signed by its fee payer.'
        );
    });
});

describe('signTransaction', () => {
    const MOCK_TRANSACTION = {} as unknown as Parameters<typeof signTransaction>[1];
    const MOCK_SIGNATURE_A = new Uint8Array(Array(64).fill(1));
    const MOCK_SIGNATURE_B = new Uint8Array(Array(64).fill(2));
    const MOCK_SIGNATURE_C = new Uint8Array(Array(64).fill(3));
    const mockKeyPairA = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockKeyPairB = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockKeyPairC = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockPublicKeyAddressA = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as Address<'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'>;
    const mockPublicKeyAddressB = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' as Address<'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'>;
    const mockPublicKeyAddressC = 'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC' as Address<'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC'>;
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
                /* 3: system program */ '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>,
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
                    return '99999999999999999999999999999999' as Address<'99999999999999999999999999999999'>;
            }
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
        (getAddressEncoder as jest.Mock).mockReturnValue({
            encode: jest.fn().mockReturnValue('fAkEbAsE58AdDrEsS'),
        });
        (getAddressDecoder as jest.Mock).mockReturnValue({});
        (getAddressCodec as jest.Mock).mockReturnValue({
            encode: jest.fn().mockReturnValue('fAkEbAsE58AdDrEsS'),
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

describe('assertTransactionIsFullySigned', () => {
    type SignedTransaction = CompilableTransaction & ITransactionWithSignatures;

    const mockProgramAddress = 'program' as Address;
    const mockPublicKeyAddressA = 'A' as Address;
    const mockSignatureA = new Uint8Array(0) as Ed25519Signature;
    const mockPublicKeyAddressB = 'B' as Address;
    const mockSignatureB = new Uint8Array(1) as Ed25519Signature;
    const mockPublicKeyAddressC = 'C' as Address;
    const mockSignatureC = new Uint8Array(2) as Ed25519Signature;

    const mockBlockhashConstraint = {
        blockhash: 'a' as Blockhash,
        lastValidBlockHeight: 100n,
    };

    it('throws if the transaction has no signature for the fee payer', () => {
        const transaction: SignedTransaction = {
            feePayer: mockPublicKeyAddressA,
            instructions: [],
            lifetimeConstraint: mockBlockhashConstraint,
            signatures: {},
            version: 0,
        };

        expect(() => assertTransactionIsFullySigned(transaction)).toThrow(
            'Transaction is missing signature for address `A`'
        );
    });

    it('throws if the transaction has no signature for an instruction readonly signer', () => {
        const transaction: SignedTransaction = {
            feePayer: mockPublicKeyAddressA,
            instructions: [
                {
                    accounts: [
                        {
                            address: mockPublicKeyAddressB,
                            role: AccountRole.READONLY_SIGNER,
                        },
                    ],
                    programAddress: mockProgramAddress,
                },
            ],
            lifetimeConstraint: mockBlockhashConstraint,
            signatures: {
                [mockPublicKeyAddressA]: mockSignatureA,
            },
            version: 0,
        };

        expect(() => assertTransactionIsFullySigned(transaction)).toThrow(
            'Transaction is missing signature for address `B`'
        );
    });

    it('throws if the transaction has no signature for an instruction writable signer', () => {
        const transaction: SignedTransaction = {
            feePayer: mockPublicKeyAddressA,
            instructions: [
                {
                    accounts: [
                        {
                            address: mockPublicKeyAddressB,
                            role: AccountRole.WRITABLE_SIGNER,
                        },
                    ],
                    programAddress: mockProgramAddress,
                },
            ],
            lifetimeConstraint: mockBlockhashConstraint,
            signatures: {
                [mockPublicKeyAddressA]: mockSignatureA,
            },
            version: 0,
        };

        expect(() => assertTransactionIsFullySigned(transaction)).toThrow(
            'Transaction is missing signature for address `B`'
        );
    });

    it('throws if the transaction has multiple instructions and one is missing a signer', () => {
        const transaction: SignedTransaction = {
            feePayer: mockPublicKeyAddressA,
            instructions: [
                {
                    accounts: [
                        {
                            address: mockPublicKeyAddressB,
                            role: AccountRole.WRITABLE_SIGNER,
                        },
                    ],
                    programAddress: mockProgramAddress,
                },
                {
                    accounts: [
                        {
                            address: mockPublicKeyAddressC,
                            role: AccountRole.WRITABLE_SIGNER,
                        },
                    ],
                    programAddress: mockProgramAddress,
                },
            ],
            lifetimeConstraint: mockBlockhashConstraint,
            signatures: {
                [mockPublicKeyAddressA]: mockSignatureA,
                [mockPublicKeyAddressB]: mockSignatureB,
            },
            version: 0,
        };

        expect(() => assertTransactionIsFullySigned(transaction)).toThrow(
            'Transaction is missing signature for address `C`'
        );
    });

    it('does not throw if the transaction has no instructions and is signed by the fee payer', () => {
        const transaction: SignedTransaction = {
            feePayer: mockPublicKeyAddressA,
            instructions: [],
            lifetimeConstraint: mockBlockhashConstraint,
            signatures: {
                [mockPublicKeyAddressA]: mockSignatureA,
            },
            version: 0,
        };

        expect(() => assertTransactionIsFullySigned(transaction)).not.toThrow();
    });

    it('does not throw if the transaction has an instruction and is signed by the fee payer and instruction signer', () => {
        const transaction: SignedTransaction = {
            feePayer: mockPublicKeyAddressA,
            instructions: [
                {
                    accounts: [
                        {
                            address: mockPublicKeyAddressB,
                            role: AccountRole.WRITABLE_SIGNER,
                        },
                    ],
                    programAddress: mockProgramAddress,
                },
            ],
            lifetimeConstraint: mockBlockhashConstraint,
            signatures: {
                [mockPublicKeyAddressA]: mockSignatureA,
                [mockPublicKeyAddressB]: mockSignatureB,
            },
            version: 0,
        };

        expect(() => assertTransactionIsFullySigned(transaction)).not.toThrow();
    });

    it('does not throw if the transaction has multiple instructions and is signed by all signers', () => {
        const transaction: SignedTransaction = {
            feePayer: mockPublicKeyAddressA,
            instructions: [
                {
                    accounts: [
                        {
                            address: mockPublicKeyAddressB,
                            role: AccountRole.WRITABLE_SIGNER,
                        },
                    ],
                    programAddress: mockProgramAddress,
                },
                {
                    accounts: [
                        {
                            address: mockPublicKeyAddressC,
                            role: AccountRole.WRITABLE_SIGNER,
                        },
                    ],
                    programAddress: mockProgramAddress,
                },
            ],
            lifetimeConstraint: mockBlockhashConstraint,
            signatures: {
                [mockPublicKeyAddressA]: mockSignatureA,
                [mockPublicKeyAddressB]: mockSignatureB,
                [mockPublicKeyAddressC]: mockSignatureC,
            },
            version: 0,
        };

        expect(() => assertTransactionIsFullySigned(transaction)).not.toThrow();
    });

    it('does not throw if the transaction has an instruction with a non-signer account', () => {
        const transaction: SignedTransaction = {
            feePayer: mockPublicKeyAddressA,
            instructions: [
                {
                    accounts: [
                        {
                            address: mockPublicKeyAddressB,
                            role: AccountRole.WRITABLE,
                        },
                    ],
                    programAddress: mockProgramAddress,
                },
            ],
            lifetimeConstraint: mockBlockhashConstraint,
            signatures: {
                [mockPublicKeyAddressA]: mockSignatureA,
            },
            version: 0,
        };

        expect(() => assertTransactionIsFullySigned(transaction)).not.toThrow();
    });

    it('does not throw if the transaction has an instruction with no accounts', () => {
        const transaction: SignedTransaction = {
            feePayer: mockPublicKeyAddressA,
            instructions: [
                {
                    programAddress: mockProgramAddress,
                },
            ],
            lifetimeConstraint: mockBlockhashConstraint,
            signatures: {
                [mockPublicKeyAddressA]: mockSignatureA,
            },
            version: 0,
        };

        expect(() => assertTransactionIsFullySigned(transaction)).not.toThrow();
    });
});
