import '@solana/test-matchers/toBeFrozenObject';

import { Address, getAddressFromPublicKey } from '@solana/addresses';
import { ReadonlyUint8Array } from '@solana/codecs-core';
import {
    SOLANA_ERROR__TRANSACTION__ADDRESSES_CANNOT_SIGN_TRANSACTION,
    SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING,
    SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING,
    SolanaError,
} from '@solana/errors';
import { SignatureBytes, signBytes } from '@solana/keys';

import { NewTransaction, OrderedMap, TransactionMessageBytes } from '../new-compile-transaction';
import {
    newAssertTransactionIsFullySigned,
    newGetSignatureFromTransaction,
    newPartiallySignTransaction,
    newSignTransaction,
} from '../new-signatures';

jest.mock('@solana/addresses');
jest.mock('@solana/keys');
jest.mock('../message');
jest.mock('../serializers/message');

describe('getSignatureFromTransaction', () => {
    it("returns the signature associated with a transaction's fee payer", () => {
        const signatures: OrderedMap<Address, SignatureBytes | null> = {};
        signatures['123' as Address] = new Uint8Array(new Array(64).fill(9)) as SignatureBytes;
        const transactionWithFeePayerSignature: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures,
        };
        expect(newGetSignatureFromTransaction(transactionWithFeePayerSignature)).toBe(
            'BUguQsv2ZuHus54HAFzjdJHzZBkygAjKhEeYwSG19tUfUyvvz3worsdQCdAXDNjakJHioSiyxhFiDJrm8XpSXRA',
        );
    });
    it('throws when supplied a transaction that has not been signed by the fee payer', () => {
        const transactionWithoutFeePayerSignature: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {},
        };
        expect(() => {
            newGetSignatureFromTransaction(transactionWithoutFeePayerSignature);
        }).toThrow(new SolanaError(SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING));
    });
});

describe('partiallySignTransaction', () => {
    const MOCK_SIGNATURE_A = new Uint8Array(Array(64).fill(1)) as SignatureBytes;
    const MOCK_SIGNATURE_B = new Uint8Array(Array(64).fill(2)) as SignatureBytes;
    const MOCK_SIGNATURE_C = new Uint8Array(Array(64).fill(3)) as SignatureBytes;
    const mockKeyPairA = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockKeyPairB = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockKeyPairC = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockPublicKeyAddressA = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as Address<'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'>;
    const mockPublicKeyAddressB = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' as Address<'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'>;
    const mockPublicKeyAddressC = 'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC' as Address<'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC'>;
    beforeEach(() => {
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
        (signBytes as jest.Mock).mockClear();
    });
    it("returns a signed transaction object having the first signer's signature", async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: null,
            },
        };

        const partiallySignedTransactionPromise = newPartiallySignTransaction([mockKeyPairA], transaction);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({
                [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
            }),
        );
    });
    it('returns unchanged compiled message bytes', async () => {
        expect.assertions(1);
        const messageBytes = new Uint8Array([1, 2, 3]) as ReadonlyUint8Array as TransactionMessageBytes;
        const transaction: NewTransaction = {
            messageBytes: messageBytes as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: null,
            },
        };
        const partiallySignedTransactionPromise = newPartiallySignTransaction([mockKeyPairA], transaction);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty('messageBytes', messageBytes);
    });
    it('returns a signed transaction object having null for the missing signers', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: null,
                [mockPublicKeyAddressB]: null,
                [mockPublicKeyAddressC]: null,
            },
        };
        const partiallySignedTransactionPromise = newPartiallySignTransaction([mockKeyPairA], transaction);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({
                [mockPublicKeyAddressB]: null,
                [mockPublicKeyAddressC]: null,
            }),
        );
    });
    it("returns a transaction object having the second signer's signature", async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: null,
                [mockPublicKeyAddressB]: null,
            },
        };
        const partiallySignedTransactionPromise = newPartiallySignTransaction([mockKeyPairB], transaction);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({
                [mockPublicKeyAddressB]: MOCK_SIGNATURE_B,
            }),
        );
    });
    it('returns a transaction object having multiple signatures', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: null,
                [mockPublicKeyAddressB]: null,
                [mockPublicKeyAddressC]: null,
            },
        };
        const partiallySignedTransactionPromise = newPartiallySignTransaction(
            [mockKeyPairA, mockKeyPairB, mockKeyPairC],
            transaction,
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
    it('stores the signatures in the order specified on the compiled message', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: null,
                [mockPublicKeyAddressB]: null,
                [mockPublicKeyAddressC]: null,
            },
        };
        const { signatures } = await newPartiallySignTransaction(
            [mockKeyPairC, mockKeyPairB, mockKeyPairA],
            transaction,
        );
        const orderedAddresses = Object.keys(signatures);
        expect(orderedAddresses).toEqual([mockPublicKeyAddressA, mockPublicKeyAddressB, mockPublicKeyAddressC]);
    });
    it('does not modify an existing signature when the signature is the same', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
                [mockPublicKeyAddressB]: null,
            },
        };
        const partiallySignedTransactionPromise = newPartiallySignTransaction([mockKeyPairB], transaction);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({
                [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
            }),
        );
    });
    it('produces a new signature for an existing signer', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
            },
        };
        await newPartiallySignTransaction([mockKeyPairA], transaction);
        expect(signBytes as jest.Mock).toHaveBeenCalledTimes(1);
    });
    it('modifies the existing signature when the signature is different', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: new Uint8Array([1, 2, 3, 4]) as ReadonlyUint8Array as SignatureBytes,
            },
        };
        const partiallySignedTransactionPromise = newPartiallySignTransaction([mockKeyPairA], transaction);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({
                [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
            }),
        );
    });
    it('produces a signature for a new signer when there is an existing one', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
                [mockPublicKeyAddressB]: null,
            },
        };
        const partiallySignedTransactionPromise = newPartiallySignTransaction([mockKeyPairB], transaction);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({
                [mockPublicKeyAddressB]: MOCK_SIGNATURE_B,
            }),
        );
    });
    it('freezes the object', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: null,
            },
        };
        await expect(newPartiallySignTransaction([mockKeyPairA], transaction)).resolves.toBeFrozenObject();
    });
    it('returns the input transaction object if no signatures changed', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
            },
        };
        await expect(newPartiallySignTransaction([mockKeyPairA], transaction)).resolves.toBe(transaction);
    });
    it('throws if a keypair is for an address that is not in the signatures of the transaction', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: null,
            },
        };
        await expect(newPartiallySignTransaction([mockKeyPairB], transaction)).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__TRANSACTION__ADDRESSES_CANNOT_SIGN_TRANSACTION, {
                expectedAddresses: [mockPublicKeyAddressA],
                unexpectedAddresses: [mockPublicKeyAddressB],
            }),
        );
    });
    it('throws with multiple addresses if there are multiple keypairs that are not in the signatures', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: null,
            },
        };
        await expect(newPartiallySignTransaction([mockKeyPairB, mockKeyPairC], transaction)).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__TRANSACTION__ADDRESSES_CANNOT_SIGN_TRANSACTION, {
                expectedAddresses: [mockPublicKeyAddressA],
                unexpectedAddresses: [mockPublicKeyAddressB, mockPublicKeyAddressC],
            }),
        );
    });
});

describe('signTransaction', () => {
    const mockPublicKeyAddressA = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as Address<'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'>;
    const mockPublicKeyAddressB = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' as Address<'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'>;
    const MOCK_SIGNATURE_A = new Uint8Array(Array(64).fill(1)) as SignatureBytes;
    const MOCK_SIGNATURE_B = new Uint8Array(Array(64).fill(2)) as SignatureBytes;
    const mockKeyPairA = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    const mockKeyPairB = { privateKey: {} as CryptoKey, publicKey: {} as CryptoKey } as CryptoKeyPair;
    beforeEach(() => {
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
    });
    it('fatals when missing a signer', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: null,
                [mockPublicKeyAddressB]: null,
            },
        };
        const signedTransactionPromise = newSignTransaction([mockKeyPairA], transaction);
        await expect(signedTransactionPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
                addresses: [mockPublicKeyAddressB],
            }),
        );
    });
    it('returns a signed transaction object with multiple signatures', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: null,
                [mockPublicKeyAddressB]: null,
            },
        };
        const partiallySignedTransactionPromise = newSignTransaction([mockKeyPairA, mockKeyPairB], transaction);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty(
            'signatures',
            expect.objectContaining({
                [mockPublicKeyAddressA]: MOCK_SIGNATURE_A,
                [mockPublicKeyAddressB]: MOCK_SIGNATURE_B,
            }),
        );
    });
    it('returns a signed transaction object with the compiled message bytes', async () => {
        expect.assertions(1);
        const messageBytes = new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes;
        const transaction: NewTransaction = {
            messageBytes,
            signatures: {
                [mockPublicKeyAddressA]: null,
                [mockPublicKeyAddressB]: null,
            },
        };
        const partiallySignedTransactionPromise = newSignTransaction([mockKeyPairA, mockKeyPairB], transaction);
        await expect(partiallySignedTransactionPromise).resolves.toHaveProperty('messageBytes', messageBytes);
    });
    it('stores the signatures in the order specified on the compiled message', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: null,
                [mockPublicKeyAddressB]: null,
            },
        };
        const { signatures } = await newSignTransaction([mockKeyPairB, mockKeyPairA], transaction);
        const orderedAddresses = Object.keys(signatures);
        expect(orderedAddresses).toEqual([mockPublicKeyAddressA, mockPublicKeyAddressB]);
    });
    it('freezes the object', async () => {
        expect.assertions(1);
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures: {
                [mockPublicKeyAddressA]: null,
                [mockPublicKeyAddressB]: null,
            },
        };
        await expect(newSignTransaction([mockKeyPairA, mockKeyPairB], transaction)).resolves.toBeFrozenObject();
    });
});

describe('assertTransactionIsFullySigned', () => {
    const mockPublicKeyAddressA = 'A' as Address;
    const mockSignatureA = new Uint8Array(0) as SignatureBytes;
    const mockPublicKeyAddressB = 'B' as Address;
    const mockSignatureB = new Uint8Array(1) as SignatureBytes;

    it('throws if the transaction has no signature for the fee payer', () => {
        const signatures: OrderedMap<Address, SignatureBytes | null> = {};
        signatures[mockPublicKeyAddressA] = null;
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures,
        };

        expect(() => newAssertTransactionIsFullySigned(transaction)).toThrow(
            new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
                addresses: [mockPublicKeyAddressA],
            }),
        );
    });

    it('throws all missing signers if the transaction has no signature for multiple signers', () => {
        const signatures: OrderedMap<Address, SignatureBytes | null> = {};
        signatures[mockPublicKeyAddressA] = null;
        signatures[mockPublicKeyAddressB] = null;
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures,
        };

        expect(() => newAssertTransactionIsFullySigned(transaction)).toThrow(
            new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
                addresses: [mockPublicKeyAddressA, mockPublicKeyAddressB],
            }),
        );
    });

    it('does not throw if the transaction is signed by its only signer', () => {
        const signatures: OrderedMap<Address, SignatureBytes | null> = {};
        signatures[mockPublicKeyAddressA] = mockSignatureA;
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures,
        };

        expect(() => newAssertTransactionIsFullySigned(transaction)).not.toThrow();
    });

    it('does not throw if the transaction is signed by all its signers', () => {
        const signatures: OrderedMap<Address, SignatureBytes | null> = {};
        signatures[mockPublicKeyAddressA] = mockSignatureA;
        signatures[mockPublicKeyAddressB] = mockSignatureB;
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures,
        };

        expect(() => newAssertTransactionIsFullySigned(transaction)).not.toThrow();
    });

    it('does not throw if the transaction has no signatures', () => {
        const signatures: OrderedMap<Address, SignatureBytes | null> = {};
        const transaction: NewTransaction = {
            messageBytes: new Uint8Array() as ReadonlyUint8Array as TransactionMessageBytes,
            signatures,
        };
        expect(() => newAssertTransactionIsFullySigned(transaction)).not.toThrow();
    });
});
