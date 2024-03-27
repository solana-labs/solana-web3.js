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

import { CompiledMessage, compileMessage } from '../message';
import {
    INewTransactionWithSignatures,
    newAssertTransactionIsFullySigned,
    newGetSignatureFromTransaction,
    newPartiallySignTransaction,
    newSignTransaction,
    TransactionMessageBytes,
} from '../new-signatures';
import { OrderedMap } from '../ordered-map';
import { getCompiledMessageEncoder } from '../serializers';

jest.mock('@solana/addresses');
jest.mock('@solana/keys');
jest.mock('../message');
jest.mock('../serializers/message');

describe('getSignatureFromTransaction', () => {
    it("returns the signature associated with a transaction's fee payer", () => {
        const signatures = new OrderedMap<Address, SignatureBytes | null>();
        signatures.set('123' as Address, new Uint8Array(new Array(64).fill(9)) as SignatureBytes);
        const transactionWithFeePayerSignature: INewTransactionWithSignatures = {
            messageBytes: new Uint8Array() as TransactionMessageBytes,
            signatures,
        };
        expect(newGetSignatureFromTransaction(transactionWithFeePayerSignature)).toBe(
            'BUguQsv2ZuHus54HAFzjdJHzZBkygAjKhEeYwSG19tUfUyvvz3worsdQCdAXDNjakJHioSiyxhFiDJrm8XpSXRA',
        );
    });
    it('throws when supplied a transaction that has not been signed by the fee payer', () => {
        const transactionWithoutFeePayerSignature: INewTransactionWithSignatures = {
            messageBytes: new Uint8Array() as TransactionMessageBytes,
            signatures: new OrderedMap(),
        };
        expect(() => {
            newGetSignatureFromTransaction(transactionWithoutFeePayerSignature);
        }).toThrow(new SolanaError(SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING));
    });
});

describe('partiallySignTransaction', () => {
    const MOCK_TRANSACTION = {} as unknown as Parameters<typeof newPartiallySignTransaction>[1];
    const MOCK_SIGNATURE_A = new Uint8Array(Array(64).fill(1));
    const MOCK_SIGNATURE_B = new Uint8Array(Array(64).fill(2));
    const MOCK_SIGNATURE_C = new Uint8Array(Array(64).fill(3));
    const mockKeyPairA = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockKeyPairB = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockKeyPairC = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockPublicKeyAddressA = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as Address<'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'>;
    const mockPublicKeyAddressB = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' as Address<'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'>;
    const mockPublicKeyAddressC = 'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC' as Address<'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC'>;
    const mockCompiledMessageBytes = new Uint8Array(Array(100)).fill(4);
    beforeEach(() => {
        (compileMessage as jest.Mock).mockReturnValue({
            header: {
                numReadonlyNonSignerAccounts: 2,
                numReadonlySignerAccounts: 1,
                numSignerAccounts: 3,
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
        (getCompiledMessageEncoder as jest.Mock).mockReturnValue({
            encode: jest.fn().mockReturnValue(mockCompiledMessageBytes),
        });
    });
    it("returns a signed transaction object having the first signer's signature", async () => {
        expect.assertions(1);
        const { signatures } = await newPartiallySignTransaction([mockKeyPairA], MOCK_TRANSACTION);
        expect(signatures.get(mockPublicKeyAddressA)).toBe(MOCK_SIGNATURE_A);
    });
    it('returns the compiled message bytes', async () => {
        expect.assertions(1);
        const partiallySignedTransactionPromise = newPartiallySignTransaction([mockKeyPairA], MOCK_TRANSACTION);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'messageBytes',
            mockCompiledMessageBytes,
        );
    });
    it('returns a signed transaction object having null for the missing signers', async () => {
        expect.assertions(2);
        const { signatures } = await newPartiallySignTransaction([mockKeyPairA], MOCK_TRANSACTION);
        expect(signatures.get(mockPublicKeyAddressB)).toBeNull();
        expect(signatures.get(mockPublicKeyAddressC)).toBeNull();
    });
    it("returns a transaction object having the second signer's signature", async () => {
        expect.assertions(1);
        const signedTransaction = await newPartiallySignTransaction([mockKeyPairB], MOCK_TRANSACTION);
        expect(signedTransaction.signatures.get(mockPublicKeyAddressB)).toBe(MOCK_SIGNATURE_B);
    });
    it('returns a transaction object having multiple signatures', async () => {
        expect.assertions(3);
        const { signatures } = await newPartiallySignTransaction(
            [mockKeyPairA, mockKeyPairB, mockKeyPairC],
            MOCK_TRANSACTION,
        );
        expect(signatures.get(mockPublicKeyAddressA)).toBe(MOCK_SIGNATURE_A);
        expect(signatures.get(mockPublicKeyAddressB)).toBe(MOCK_SIGNATURE_B);
        expect(signatures.get(mockPublicKeyAddressC)).toBe(MOCK_SIGNATURE_C);
    });
    it('stores the signatures in the order specified on the compiled message', async () => {
        expect.assertions(1);
        const { signatures } = await newPartiallySignTransaction(
            [mockKeyPairC, mockKeyPairB, mockKeyPairA],
            MOCK_TRANSACTION,
        );
        const orderedAddresses: Address[] = [];
        signatures.forEach((address, _signature) => {
            orderedAddresses.push(address);
        });
        expect(orderedAddresses).toEqual([mockPublicKeyAddressA, mockPublicKeyAddressB, mockPublicKeyAddressC]);
    });
    it('freezes the object', async () => {
        expect.assertions(1);
        await expect(newPartiallySignTransaction([mockKeyPairA], MOCK_TRANSACTION)).resolves.toBeFrozenObject();
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
    } as unknown as Parameters<typeof newSignTransaction>[1];
    const MOCK_SIGNATURE_A = new Uint8Array(Array(64).fill(1));
    const MOCK_SIGNATURE_B = new Uint8Array(Array(64).fill(2));
    const mockKeyPairA = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockKeyPairB = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockCompiledMessageBytes = new Uint8Array(Array(100).fill(3));
    beforeEach(() => {
        (compileMessage as jest.Mock).mockReturnValue({
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
        (getCompiledMessageEncoder as jest.Mock).mockReturnValue({
            encode: jest.fn().mockReturnValue(mockCompiledMessageBytes),
        });
    });
    it('fatals when missing a signer', async () => {
        expect.assertions(1);
        const signedTransactionPromise = newSignTransaction([mockKeyPairA], MOCK_TRANSACTION);
        await expect(signedTransactionPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
                addresses: [mockPublicKeyAddressB],
            }),
        );
    });
    it('returns a signed transaction object with multiple signatures', async () => {
        expect.assertions(2);
        const { signatures } = await newSignTransaction([mockKeyPairA, mockKeyPairB], MOCK_TRANSACTION);
        expect(signatures.get(mockPublicKeyAddressA)).toBe(MOCK_SIGNATURE_A);
        expect(signatures.get(mockPublicKeyAddressB)).toBe(MOCK_SIGNATURE_B);
    });
    it('returns a signed transaction object with the compiled message bytes', async () => {
        expect.assertions(1);
        const partiallySignedTransactionPromise = newSignTransaction([mockKeyPairA, mockKeyPairB], MOCK_TRANSACTION);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'messageBytes',
            mockCompiledMessageBytes,
        );
    });
    it('stores the signatures in the order specified on the compiled message', async () => {
        expect.assertions(1);
        const { signatures } = await newSignTransaction([mockKeyPairB, mockKeyPairA], MOCK_TRANSACTION);
        const orderedAddresses: Address[] = [];
        signatures.forEach((address, _signature) => {
            orderedAddresses.push(address);
        });
        expect(orderedAddresses).toEqual([mockPublicKeyAddressA, mockPublicKeyAddressB]);
    });
    it('freezes the object', async () => {
        expect.assertions(1);
        await expect(newSignTransaction([mockKeyPairA, mockKeyPairB], MOCK_TRANSACTION)).resolves.toBeFrozenObject();
    });
});

describe('assertTransactionIsFullySigned', () => {
    const mockPublicKeyAddressA = 'A' as Address;
    const mockSignatureA = new Uint8Array(0) as SignatureBytes;
    const mockPublicKeyAddressB = 'B' as Address;
    const mockSignatureB = new Uint8Array(1) as SignatureBytes;

    it('throws if the transaction has no signature for the fee payer', () => {
        const signatures = new OrderedMap<Address, SignatureBytes | null>();
        signatures.set(mockPublicKeyAddressA, null);
        const transaction: INewTransactionWithSignatures = {
            messageBytes: new Uint8Array() as TransactionMessageBytes,
            signatures,
        };

        expect(() => newAssertTransactionIsFullySigned(transaction)).toThrow(
            new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
                addresses: [mockPublicKeyAddressA],
            }),
        );
    });

    it('throws all missing signers if the transaction has no signature for multiple signers', () => {
        const signatures = new OrderedMap<Address, SignatureBytes | null>();
        signatures.set(mockPublicKeyAddressA, null);
        signatures.set(mockPublicKeyAddressB, null);
        const transaction: INewTransactionWithSignatures = {
            messageBytes: new Uint8Array() as TransactionMessageBytes,
            signatures,
        };

        expect(() => newAssertTransactionIsFullySigned(transaction)).toThrow(
            new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
                addresses: [mockPublicKeyAddressA, mockPublicKeyAddressB],
            }),
        );
    });

    it('does not throw if the transaction is signed by its only signer', () => {
        const signatures = new OrderedMap<Address, SignatureBytes | null>();
        signatures.set(mockPublicKeyAddressA, mockSignatureA);
        const transaction: INewTransactionWithSignatures = {
            messageBytes: new Uint8Array() as TransactionMessageBytes,
            signatures,
        };

        expect(() => newAssertTransactionIsFullySigned(transaction)).not.toThrow();
    });

    it('does not throw if the transaction is signed by all its signers', () => {
        const signatures = new OrderedMap<Address, SignatureBytes | null>();
        signatures.set(mockPublicKeyAddressA, mockSignatureA);
        signatures.set(mockPublicKeyAddressB, mockSignatureB);
        const transaction: INewTransactionWithSignatures = {
            messageBytes: new Uint8Array() as TransactionMessageBytes,
            signatures,
        };

        expect(() => newAssertTransactionIsFullySigned(transaction)).not.toThrow();
    });

    it('does not throw if the transaction has no signatures', () => {
        const signatures = new OrderedMap<Address, SignatureBytes | null>();
        const transaction: INewTransactionWithSignatures = {
            messageBytes: new Uint8Array() as TransactionMessageBytes,
            signatures,
        };
        expect(() => newAssertTransactionIsFullySigned(transaction)).not.toThrow();
    });
});
