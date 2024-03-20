import { VersionedTransaction } from '../versioned-transaction.js';

const TRANSACTION_MESSAGE_IN_WIRE_FORMAT =
    // prettier-ignore
    new Uint8Array([
        /** VERSION HEADER */
        128, // 0 + version mask

        /** MESSAGE HEADER */
        1, // numSignerAccounts
        0, // numReadonlySignerAccount
        0, // numReadonlyNonSignerAccounts

        /** STATIC ADDRESSES */
        1, // Number of static accounts
        11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, // k7FaK87WHGVXzkaoHb7CdVPgkKDQhZ29VLDeBVbDfYn

        /** TRANSACTION LIFETIME TOKEN (ie. the blockhash) */
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, // 3EKkiwNLWqoUbzFkPrmKbtUB4EweE6f4STzevYUmezeL

        /* INSTRUCTIONS */
        0, // Number of instructions

        /** ADDRESS TABLE LOOKUPS */
        0, // Number of address table lookups
    ]);

describe('VersionedTransactionSham', () => {
    it('fatals when `deserialize()` is called with a non-parseable transaction', () => {
        expect(() => VersionedTransaction.deserialize(new Uint8Array([]))).toThrow();
    });
    describe('given a signed transaction', () => {
        let signedTx: VersionedTransaction;
        const MOCK_SIGNATURE = Array(64).fill(2);
        beforeEach(() => {
            signedTx = VersionedTransaction.deserialize(
                new Uint8Array([
                    /** SIGNATURES */
                    1, // Length of signatures array
                    ...MOCK_SIGNATURE,

                    ...TRANSACTION_MESSAGE_IN_WIRE_FORMAT,
                ]),
            );
        });
        it('vends the signature of a transaction through the `signatures` property', () => {
            expect(signedTx).toHaveProperty('signatures', [expect.objectContaining(MOCK_SIGNATURE)]);
        });
        it.each(['addSignature', 'serialize', 'sign'] as (keyof VersionedTransaction)[])(
            'throws when calling `%s`',
            method => {
                expect(() => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    signedTx[method]();
                }).toThrow(`VersionedTransaction#${method} is unimplemented`);
            },
        );
        it.each(['message'] as (keyof VersionedTransaction)[])('fatals when accessing `%s`', property => {
            expect(() => {
                signedTx[property];
            }).toThrow(`VersionedTransaction#${property} (getter) is unimplemented`);
        });
    });
    describe('given an unsigned transaction', () => {
        let unsignedTx: VersionedTransaction;
        beforeEach(() => {
            unsignedTx = VersionedTransaction.deserialize(
                new Uint8Array([
                    /** SIGNATURES */
                    0, // Length of signatures array

                    ...TRANSACTION_MESSAGE_IN_WIRE_FORMAT,
                ]),
            );
        });
        it('vends an all-zero signature for an unsigned transaction through the `signatures` property', () => {
            expect(unsignedTx).toHaveProperty('signatures', [new Uint8Array(64)]);
        });
    });
    describe('given a version 42 transaction', () => {
        let version42Transaction: VersionedTransaction;
        beforeEach(() => {
            version42Transaction = VersionedTransaction.deserialize(
                new Uint8Array([
                    /** SIGNATURES */
                    0, // Length of signatures array

                    /** VERSION HEADER */
                    42 + 128, // 42 + version mask

                    ...TRANSACTION_MESSAGE_IN_WIRE_FORMAT.slice(1),
                ]),
            );
        });
        it('vends `42` through the `version` property', () => {
            expect(version42Transaction.version).toBe(42);
        });
    });
});
