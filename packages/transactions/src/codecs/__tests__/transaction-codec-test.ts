import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';
import { ReadonlyUint8Array, VariableSizeDecoder, VariableSizeEncoder } from '@solana/codecs-core';
import { SOLANA_ERROR__TRANSACTION__MESSAGE_SIGNATURES_MISMATCH, SolanaError } from '@solana/errors';
import { SignatureBytes } from '@solana/keys';

import { NewTransaction, TransactionMessageBytes } from '../../transaction';
import { getSignaturesEncoder } from '../signatures-encoder';
import { getTransactionCodec, getTransactionDecoder, getTransactionEncoder } from '../transaction-codec';

jest.mock('../signatures-encoder');

describe.each([getTransactionEncoder, getTransactionCodec])('Transaction encoder %p', encoderFactory => {
    const mockEncodedSignatures = new Uint8Array([1, 2, 3]);
    let encoder: VariableSizeEncoder<NewTransaction>;
    beforeEach(() => {
        (getSignaturesEncoder as jest.Mock).mockReturnValue({
            getSizeFromValue: jest.fn().mockReturnValue(mockEncodedSignatures.length),
            write: jest.fn().mockImplementation((_value, bytes: Uint8Array, offset: number) => {
                bytes.set(mockEncodedSignatures, offset);
                return offset + mockEncodedSignatures.length;
            }),
        });
        encoder = encoderFactory();
    });

    it('should encode the transaction correctly', () => {
        const messageBytes = new Uint8Array([4, 5, 6]) as ReadonlyUint8Array as TransactionMessageBytes;

        const transaction: NewTransaction = {
            messageBytes,
            signatures: {},
        };

        expect(encoder.encode(transaction)).toStrictEqual(
            new Uint8Array([
                /* signatures */
                ...mockEncodedSignatures,
                /* message bytes */
                ...messageBytes,
            ]),
        );
    });
});

describe.each([getTransactionDecoder, getTransactionCodec])('Transaction decoder %p', decoderFactory => {
    let decoder: VariableSizeDecoder<NewTransaction>;
    beforeEach(() => {
        (getSignaturesEncoder as jest.Mock).mockReturnValue({
            getSizeFromValue: jest.fn().mockReturnValue(0),
            write: jest.fn(),
        });
        decoder = decoderFactory();
    });

    describe('for a transaction with a single signature', () => {
        const addressBytes = new Uint8Array(64).fill(11);
        const address = 'k7FaK87WHGVXzkaoHb7CdVPgkKDQhZ29VLDeBVbDfYn' as Address;

        it('should decode the transaction correctly when the signature is defined', () => {
            const signature = new Uint8Array(64).fill(1) as ReadonlyUint8Array as SignatureBytes;
            const messageBytes = new Uint8Array([
                /** VERSION HEADER */
                128, // 0 + version mask

                /** MESSAGE HEADER */
                1, // numSignerAccounts
                0, // numReadonlySignerAccount
                1, // numReadonlyNonSignerAccounts

                /** STATIC ADDRESSES */
                2, // Number of static accounts
                ...addressBytes,
                ...new Uint8Array(64).fill(12),

                /** REST OF TRANSACTION MESSAGE (arbitrary) */
                ...new Uint8Array(100).fill(1),
            ]) as ReadonlyUint8Array as TransactionMessageBytes;

            const encodedTransaction = new Uint8Array([
                /** SIGNATURES */
                1, // num signatures
                ...signature,

                /** MESSAGE */
                ...messageBytes,
            ]);

            const expectedTransaction: NewTransaction = {
                messageBytes: messageBytes,
                signatures: {
                    [address]: signature,
                },
            };
            expect(decoder.decode(encodedTransaction)).toStrictEqual(expectedTransaction);
        });

        it('should decode the transaction correctly when the signature is not defined', () => {
            const signature = new Uint8Array(64).fill(0) as ReadonlyUint8Array as SignatureBytes;
            const messageBytes = new Uint8Array([
                /** VERSION HEADER */
                128, // 0 + version mask

                /** MESSAGE HEADER */
                1, // numSignerAccounts
                0, // numReadonlySignerAccount
                1, // numReadonlyNonSignerAccounts

                /** STATIC ADDRESSES */
                2, // Number of static accounts
                ...addressBytes,
                ...new Uint8Array(64).fill(12),

                /** REST OF TRANSACTION MESSAGE (arbitrary) */
                ...new Uint8Array(100).fill(1),
            ]) as ReadonlyUint8Array as TransactionMessageBytes;

            const encodedTransaction = new Uint8Array([
                /** SIGNATURES */
                1, // num signatures
                ...signature,

                /** MESSAGE */
                ...messageBytes,
            ]);

            const address = 'k7FaK87WHGVXzkaoHb7CdVPgkKDQhZ29VLDeBVbDfYn' as Address;
            const expectedTransaction: NewTransaction = {
                messageBytes: messageBytes,
                signatures: {
                    [address]: null,
                },
            };
            expect(decoder.decode(encodedTransaction)).toStrictEqual(expectedTransaction);
        });

        it('should freeze the signatures map', () => {
            const signature = new Uint8Array(64).fill(0) as ReadonlyUint8Array as SignatureBytes;
            const messageBytes = new Uint8Array([
                /** VERSION HEADER */
                128, // 0 + version mask

                /** MESSAGE HEADER */
                1, // numSignerAccounts
                0, // numReadonlySignerAccount
                1, // numReadonlyNonSignerAccounts

                /** STATIC ADDRESSES */
                2, // Number of static accounts
                ...addressBytes,
                ...new Uint8Array(64).fill(12),

                /** REST OF TRANSACTION MESSAGE (arbitrary) */
                ...new Uint8Array(100).fill(1),
            ]) as ReadonlyUint8Array as TransactionMessageBytes;

            const encodedTransaction = new Uint8Array([
                /** SIGNATURES */
                1, // num signatures
                ...signature,

                /** MESSAGE */
                ...messageBytes,
            ]);

            const decoded = decoder.decode(encodedTransaction);
            expect(decoded.signatures).toBeFrozenObject();
        });
    });

    describe('for a transaction with multiple signatures', () => {
        const address1Bytes = new Uint8Array(32).fill(11);
        const address1 = 'k7FaK87WHGVXzkaoHb7CdVPgkKDQhZ29VLDeBVbDfYn' as Address;

        const address2Bytes = new Uint8Array(32).fill(12);
        const address2 = 'p2Yicb86aZig616Eav2VWG9vuXR5mEqhtzshZYBxzsV' as Address;

        const address3Bytes = new Uint8Array(32).fill(13);
        const address3 = 'swqrv48gsrwpBFbftEwnP2vB4jckpvfGJfXkwaniLCC' as Address;

        const signature1 = new Uint8Array(64).fill(1) as ReadonlyUint8Array as SignatureBytes;
        const signature2 = new Uint8Array(64).fill(2) as ReadonlyUint8Array as SignatureBytes;
        const signature3 = new Uint8Array(64).fill(3) as ReadonlyUint8Array as SignatureBytes;

        it('should decode the transaction correctly when all the signatures are defined', () => {
            const messageBytes = new Uint8Array([
                /** VERSION HEADER */
                128, // 0 + version mask

                /** MESSAGE HEADER */
                3, // numSignerAccounts
                0, // numReadonlySignerAccount
                1, // numReadonlyNonSignerAccounts

                /** STATIC ADDRESSES */
                4, // Number of static accounts
                ...address1Bytes,
                ...address2Bytes,
                ...address3Bytes,
                ...new Uint8Array(64).fill(21),

                /** REST OF TRANSACTION MESSAGE (arbitrary) */
                ...new Uint8Array(100).fill(1),
            ]) as ReadonlyUint8Array as TransactionMessageBytes;

            const encodedTransaction = new Uint8Array([
                /** SIGNATURES */
                3, // num signatures
                ...signature1,
                ...signature2,
                ...signature3,

                /** MESSAGE */
                ...messageBytes,
            ]);

            const expectedTransaction: NewTransaction = {
                messageBytes: messageBytes,
                signatures: {
                    [address1]: signature1,
                    [address2]: signature2,
                    [address3]: signature3,
                },
            };
            expect(decoder.decode(encodedTransaction)).toStrictEqual(expectedTransaction);
        });

        it('should decode the transaction correctly when none of the signatures are defined', () => {
            const messageBytes = new Uint8Array([
                /** VERSION HEADER */
                128, // 0 + version mask

                /** MESSAGE HEADER */
                3, // numSignerAccounts
                0, // numReadonlySignerAccount
                1, // numReadonlyNonSignerAccounts

                /** STATIC ADDRESSES */
                4, // Number of static accounts
                ...address1Bytes,
                ...address2Bytes,
                ...address3Bytes,
                ...new Uint8Array(64).fill(21),

                /** REST OF TRANSACTION MESSAGE (arbitrary) */
                ...new Uint8Array(100).fill(1),
            ]) as ReadonlyUint8Array as TransactionMessageBytes;

            const encodedTransaction = new Uint8Array([
                /** SIGNATURES */
                3, // num signatures
                ...new Uint8Array(64).fill(0),
                ...new Uint8Array(64).fill(0),
                ...new Uint8Array(64).fill(0),

                /** MESSAGE */
                ...messageBytes,
            ]);

            const expectedTransaction: NewTransaction = {
                messageBytes: messageBytes,
                signatures: {
                    [address1]: null,
                    [address2]: null,
                    [address3]: null,
                },
            };
            expect(decoder.decode(encodedTransaction)).toStrictEqual(expectedTransaction);
        });

        it('should decode the transaction correctly when some of the signatures are defined', () => {
            const messageBytes = new Uint8Array([
                /** VERSION HEADER */
                128, // 0 + version mask

                /** MESSAGE HEADER */
                3, // numSignerAccounts
                0, // numReadonlySignerAccount
                1, // numReadonlyNonSignerAccounts

                /** STATIC ADDRESSES */
                4, // Number of static accounts
                ...address1Bytes,
                ...address2Bytes,
                ...address3Bytes,
                ...new Uint8Array(64).fill(21),

                /** REST OF TRANSACTION MESSAGE (arbitrary) */
                ...new Uint8Array(100).fill(1),
            ]) as ReadonlyUint8Array as TransactionMessageBytes;

            const encodedTransaction = new Uint8Array([
                /** SIGNATURES */
                3, // num signatures
                ...signature1,
                ...new Uint8Array(64).fill(0),
                ...signature3,

                /** MESSAGE */
                ...messageBytes,
            ]);

            const expectedTransaction: NewTransaction = {
                messageBytes: messageBytes,
                signatures: {
                    [address1]: signature1,
                    [address2]: null,
                    [address3]: signature3,
                },
            };
            expect(decoder.decode(encodedTransaction)).toStrictEqual(expectedTransaction);
        });

        it('should throw when the number of signers in the header does not match the number of signatures', () => {
            const messageBytes = new Uint8Array([
                /** VERSION HEADER */
                128, // 0 + version mask

                /** MESSAGE HEADER */
                3, // numSignerAccounts
                0, // numReadonlySignerAccount
                1, // numReadonlyNonSignerAccounts

                /** STATIC ADDRESSES */
                4, // Number of static accounts
                ...address1Bytes,
                ...address2Bytes,
                ...address3Bytes,
                ...new Uint8Array(64).fill(21),

                /** REST OF TRANSACTION MESSAGE (arbitrary) */
                ...new Uint8Array(100).fill(1),
            ]) as ReadonlyUint8Array as TransactionMessageBytes;

            const encodedTransaction = new Uint8Array([
                /** SIGNATURES */
                2, // num signatures
                ...signature1,
                ...signature2,

                /** MESSAGE */
                ...messageBytes,
            ]);

            expect(() => decoder.decode(encodedTransaction)).toThrow(
                new SolanaError(SOLANA_ERROR__TRANSACTION__MESSAGE_SIGNATURES_MISMATCH, {
                    numRequiredSignatures: 3,
                    signaturesLength: 2,
                    signerAddresses: [address1, address2, address3],
                }),
            );
        });
    });
});
