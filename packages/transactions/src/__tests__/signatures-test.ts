import '@solana/test-matchers/toBeFrozenObject';

import {
    Address,
    getAddressCodec,
    getAddressDecoder,
    getAddressEncoder,
    getAddressFromPublicKey,
} from '@solana/addresses';
import {
    SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING,
    SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING,
    SolanaError,
} from '@solana/errors';
import { AccountRole } from '@solana/instructions';
import { SignatureBytes, signBytes } from '@solana/keys';
import type { Blockhash } from '@solana/rpc-types';

import { CompilableTransaction } from '../compilable-transaction';
import { CompiledMessage, compileTransactionMessage } from '../message';
import {
    assertTransactionIsFullySigned,
    getSignatureFromTransaction,
    ITransactionWithSignatures,
    partiallySignTransaction,
    signTransaction,
} from '../signatures';

jest.mock('@solana/addresses');
jest.mock('@solana/keys');
jest.mock('../message');

describe('getSignatureFromTransaction', () => {
    it("returns the signature associated with a transaction's fee payer", () => {
        const transactionWithoutFeePayerSignature = {
            feePayer: '123' as Address,
            signatures: {
                ['123' as Address]: new Uint8Array(new Array(64).fill(9)) as SignatureBytes,
            } as const,
        };
        expect(getSignatureFromTransaction(transactionWithoutFeePayerSignature)).toBe(
            'BUguQsv2ZuHus54HAFzjdJHzZBkygAjKhEeYwSG19tUfUyvvz3worsdQCdAXDNjakJHioSiyxhFiDJrm8XpSXRA',
        );
    });
    it('throws when supplied a transaction that has not been signed by the fee payer', () => {
        const transactionWithoutFeePayerSignature = {
            feePayer: '123' as Address,
            signatures: {
                // No signature by the fee payer.
                ['456' as Address]: new Uint8Array(new Array(64).fill(9)) as SignatureBytes,
            } as const,
        };
        expect(() => {
            getSignatureFromTransaction(transactionWithoutFeePayerSignature);
        }).toThrow(new SolanaError(SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING));
    });
});

describe('partiallySignTransaction', () => {
    const MOCK_TRANSACTION = {} as unknown as Parameters<typeof partiallySignTransaction>[1];
    const MOCK_SIGNATURE_A = new Uint8Array(Array(64).fill(1));
    const MOCK_SIGNATURE_B = new Uint8Array(Array(64).fill(2));
    const MOCK_SIGNATURE_C = new Uint8Array(Array(64).fill(3));
    const mockKeyPairA = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockKeyPairB = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockKeyPairC = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockPublicKeyAddressA = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as Address<'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'>;
    const mockPublicKeyAddressB = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' as Address<'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'>;
    const mockPublicKeyAddressC = 'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC' as Address<'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC'>;
    beforeEach(() => {
        (compileTransactionMessage as jest.Mock).mockReturnValue({
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
        (getAddressFromPublicKey as jest.Mock).mockImplementation(publicKey => {
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
        (signBytes as jest.Mock).mockImplementation(secretKey => {
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
            getSizeFromValue: jest.fn().mockReturnValue(42),
            write: jest.fn().mockImplementation((_value, _bytes: Uint8Array, offset: number) => offset + 42),
        });
        (getAddressDecoder as jest.Mock).mockReturnValue({});
        (getAddressCodec as jest.Mock).mockReturnValue({
            getSizeFromValue: jest.fn().mockReturnValue(42),
            write: jest.fn().mockImplementation((_value, _bytes: Uint8Array, offset: number) => offset + 42),
        });
    });
    it("returns a transaction object having the first signer's signature", async () => {
        expect.assertions(1);
        const partiallySignedTransactionPromise = partiallySignTransaction([mockKeyPairA], MOCK_TRANSACTION);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({ [mockPublicKeyAddressA]: MOCK_SIGNATURE_A }),
        );
    });
    it("returns a transaction object having the second signer's signature", async () => {
        expect.assertions(1);
        const partiallySignedTransactionPromise = partiallySignTransaction([mockKeyPairB], MOCK_TRANSACTION);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({ [mockPublicKeyAddressB]: MOCK_SIGNATURE_B }),
        );
    });
    it('returns a transaction object having multiple signatures', async () => {
        expect.assertions(1);
        const partiallySignedTransactionPromise = partiallySignTransaction(
            [mockKeyPairA, mockKeyPairB, mockKeyPairC],
            MOCK_TRANSACTION,
        );
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({
                [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
                [mockPublicKeyAddressB]: MOCK_SIGNATURE_B,
                [mockPublicKeyAddressC]: MOCK_SIGNATURE_C,
            }),
        );
    });
    it('returns a transaction object without overwriting the existing signatures', async () => {
        expect.assertions(1);
        const mockTransactionWithSignatureForSignerA = {
            ...MOCK_TRANSACTION,
            signatures: { [mockPublicKeyAddressB]: MOCK_SIGNATURE_B },
        };
        const partiallySignedTransactionPromise = partiallySignTransaction(
            [mockKeyPairA],
            mockTransactionWithSignatureForSignerA,
        );
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({
                [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
                [mockPublicKeyAddressB]: MOCK_SIGNATURE_B,
            }),
        );
    });
    it("does not mutate the original signatures when updating a transaction's signatures", async () => {
        expect.assertions(2);
        const startingSignatures = { [mockPublicKeyAddressB]: MOCK_SIGNATURE_B } as const;
        const mockTransactionWithSignatureForSignerA = {
            ...MOCK_TRANSACTION,
            signatures: startingSignatures,
        };
        const { signatures } = await partiallySignTransaction([mockKeyPairA], mockTransactionWithSignatureForSignerA);
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
        const { signatures } = await partiallySignTransaction(
            [mockKeyPairA, mockKeyPairC],
            mockTransactionWithSignatureForSignerA,
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
        await expect(partiallySignTransaction([mockKeyPairA], MOCK_TRANSACTION)).resolves.toBeFrozenObject();
    });
});

describe('signTransaction', () => {
    const mockPublicKeyAddressA = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as Address<'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'>;
    const mockPublicKeyAddressB = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' as Address<'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'>;
    const MOCK_TRANSACTION = {
        feePayer: mockPublicKeyAddressA,
        instructions: [
            {
                accounts: [{ address: mockPublicKeyAddressB, role: AccountRole.READONLY_SIGNER }],
                programAddress: '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>,
            },
        ],
    } as unknown as Parameters<typeof signTransaction>[1];
    const MOCK_SIGNATURE_A = new Uint8Array(Array(64).fill(1));
    const MOCK_SIGNATURE_B = new Uint8Array(Array(64).fill(2));
    const mockKeyPairA = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockKeyPairB = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    beforeEach(() => {
        (compileTransactionMessage as jest.Mock).mockReturnValue({
            header: {
                numReadonlyNonSignerAccounts: 1,
                numReadonlySignerAccounts: 1,
                numSignerAccounts: 2,
            },
            instructions: [
                {
                    accountIndices: [/* mockPublicKeyAddressB */ 1],
                    programAddressIndex: 2 /* system program */,
                },
            ],
            lifetimeToken: 'fBrpLg4qfyVH8e3z4zbjAXy4kCZP2jCFdqy113vndcj' as Blockhash,
            staticAccounts: [
                /* 0: fee payer */ mockPublicKeyAddressA,
                /* 1: read-only instruction signer address */ mockPublicKeyAddressB,
                /* 2: system program */ '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>,
            ],
            version: 0,
        } as CompiledMessage);
        (getAddressFromPublicKey as jest.Mock).mockImplementation(publicKey => {
            switch (publicKey) {
                case mockKeyPairA.publicKey:
                    return mockPublicKeyAddressA;
                case mockKeyPairB.publicKey:
                    return mockPublicKeyAddressB;
                default:
                    return '99999999999999999999999999999999' as Address<'99999999999999999999999999999999'>;
            }
        });
        (signBytes as jest.Mock).mockImplementation(secretKey => {
            switch (secretKey) {
                case mockKeyPairA.privateKey:
                    return MOCK_SIGNATURE_A;
                case mockKeyPairB.privateKey:
                    return MOCK_SIGNATURE_B;
                default:
                    return new Uint8Array(Array(64).fill(0xff));
            }
        });
        (getAddressEncoder as jest.Mock).mockReturnValue({
            getSizeFromValue: jest.fn().mockReturnValue(42),
            write: jest.fn().mockImplementation((_value, _bytes: Uint8Array, offset: number) => offset + 42),
        });
        (getAddressDecoder as jest.Mock).mockReturnValue({});
        (getAddressCodec as jest.Mock).mockReturnValue({
            getSizeFromValue: jest.fn().mockReturnValue(42),
            write: jest.fn().mockImplementation((_value, _bytes: Uint8Array, offset: number) => offset + 42),
        });
    });
    it('fatals when missing a signer', async () => {
        expect.assertions(1);
        const signedTransactionPromise = signTransaction([mockKeyPairA], MOCK_TRANSACTION);
        await expect(signedTransactionPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
                addresses: [mockPublicKeyAddressB],
            }),
        );
    });
    it('returns a transaction object having multiple signatures', async () => {
        expect.assertions(1);
        const signedTransactionPromise = signTransaction([mockKeyPairA, mockKeyPairB], MOCK_TRANSACTION);
        await expect(signedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({
                [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
                [mockPublicKeyAddressB]: MOCK_SIGNATURE_B,
            }),
        );
    });
    it('returns a transaction object without overwriting the existing signatures', async () => {
        expect.assertions(1);
        const mockTransactionWithSignatureForSignerA = {
            ...MOCK_TRANSACTION,
            signatures: { [mockPublicKeyAddressB]: MOCK_SIGNATURE_B },
        };
        const signedTransactionPromise = signTransaction([mockKeyPairA], mockTransactionWithSignatureForSignerA);
        await expect(signedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({
                [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
                [mockPublicKeyAddressB]: MOCK_SIGNATURE_B,
            }),
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
        const { signatures } = await signTransaction([mockKeyPairA], mockTransactionWithSignatureForSignerA);
        expect(signatures).not.toBe(startingSignatures);
        expect(signatures).toMatchObject({
            [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
            [mockPublicKeyAddressB]: MOCK_SIGNATURE_B,
        });
    });
    it('freezes the object', async () => {
        expect.assertions(1);
        await expect(signTransaction([mockKeyPairA, mockKeyPairB], MOCK_TRANSACTION)).resolves.toBeFrozenObject();
    });
});

describe('assertTransactionIsFullySigned', () => {
    type SignedTransaction = CompilableTransaction & ITransactionWithSignatures;

    const mockProgramAddress = 'program' as Address;
    const mockPublicKeyAddressA = 'A' as Address;
    const mockSignatureA = new Uint8Array(0) as SignatureBytes;
    const mockPublicKeyAddressB = 'B' as Address;
    const mockSignatureB = new Uint8Array(1) as SignatureBytes;
    const mockPublicKeyAddressC = 'C' as Address;
    const mockSignatureC = new Uint8Array(2) as SignatureBytes;

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
            new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
                addresses: [mockPublicKeyAddressA],
            }),
        );
    });

    it('throws all missing signers if the transaction has no signature for multiple signers', () => {
        const transaction: SignedTransaction = {
            feePayer: mockPublicKeyAddressA,
            instructions: [
                {
                    accounts: [{ address: mockPublicKeyAddressB, role: AccountRole.READONLY_SIGNER }],
                    programAddress: '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>,
                },
            ],
            lifetimeConstraint: mockBlockhashConstraint,
            signatures: {},
            version: 0,
        };

        expect(() => assertTransactionIsFullySigned(transaction)).toThrow(
            new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
                addresses: [mockPublicKeyAddressA, mockPublicKeyAddressB],
            }),
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
            new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
                addresses: [mockPublicKeyAddressB],
            }),
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
            new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
                addresses: [mockPublicKeyAddressB],
            }),
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
            new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
                addresses: [mockPublicKeyAddressC],
            }),
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
