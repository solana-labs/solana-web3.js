import { NonceInformation } from '@solana/web3.js-legacy/declarations';

import { PublicKey } from '../public-key.js';
import { Transaction } from '../transaction.js';

const TRANSACTION_MESSAGE_IN_WIRE_FORMAT =
    // prettier-ignore
    new Uint8Array([
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
    ]);

describe('TransactionSham', () => {
    it.each(['populate'] as (keyof typeof Transaction)[])('throws when calling `%s`', method => {
        expect(() =>
            // This is basically just complaining that `prototype` is not callable.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            Transaction[method](),
        ).toThrow(`Transaction#${method.toString()} is unimplemented`);
    });
    it('fatals when `from()` is called with a non-parseable transaction', () => {
        expect(() => Transaction.from([])).toThrow();
    });
    describe('given a signed transaction', () => {
        let signedTx: Transaction;
        const MOCK_SIGNATURE = Array(64).fill(2);
        beforeEach(() => {
            signedTx = Transaction.from(
                new Uint8Array([
                    /** SIGNATURES */
                    1, // Length of signatures array
                    ...MOCK_SIGNATURE,

                    ...TRANSACTION_MESSAGE_IN_WIRE_FORMAT,
                ]),
            );
        });
        it('vends the signature of a transaction through the `signature` property', () => {
            expect(signedTx).toHaveProperty('signature', expect.objectContaining(MOCK_SIGNATURE));
        });
        it.each([
            'add',
            'addSignature',
            'compileMessage',
            'getEstimatedFee',
            'partialSign',
            'serializeMessage',
            'setSigners',
            'sign',
        ] as (keyof Transaction)[])('throws when calling `%s`', method => {
            expect(() => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                signedTx[method]();
            }).toThrow(`Transaction#${method} is unimplemented`);
        });
        it.each(['instructions', 'nonceInfo', 'signatures'] as (keyof Transaction)[])(
            'fatals when accessing `%s`',
            property => {
                expect(() => {
                    signedTx[property];
                }).toThrow(`Transaction#${property} (getter) is unimplemented`);
            },
        );
        it('vends the `PublicKey` of the fee payer through the `feePayer` property', () => {
            expect(signedTx.feePayer).toEqual(new PublicKey('k7FaK87WHGVXzkaoHb7CdVPgkKDQhZ29VLDeBVbDfYn'));
        });
        it('allows you to set the fee payer by assigning a `PublicKey` to the `feePayer` property', () => {
            signedTx.feePayer = new PublicKey('8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR');
            expect(signedTx.feePayer).toEqual(new PublicKey('8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR'));
        });
        it('vends the blockhash through the `recentBlockhash` property', () => {
            expect(signedTx.recentBlockhash).toBe('3EKkiwNLWqoUbzFkPrmKbtUB4EweE6f4STzevYUmezeL');
        });
        it('fatals when you set the blockhash by assigning an invalid blockhash string to the `recentBlockhash` property', () => {
            expect(() => {
                signedTx.recentBlockhash = 'bad-blockhash';
            }).toThrow();
        });
        it('allows you to set the blockhash by assigning a string to the `recentBlockhash` property', () => {
            signedTx.recentBlockhash = '8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR';
            expect(signedTx.recentBlockhash).toBe('8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR');
        });
        it('does not modify `lastValidBlockHeight` when setting `recentBlockhash`', () => {
            const currentLastValidBlockHeight = signedTx.lastValidBlockHeight;
            signedTx.recentBlockhash = '8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR';
            expect(currentLastValidBlockHeight).toBe(currentLastValidBlockHeight);
        });
        it('allows you to set the last valid block height by assigning a number to the `lastValidBlockHeight` property', () => {
            signedTx.lastValidBlockHeight = 123;
            expect(signedTx.lastValidBlockHeight).toBe(123);
        });
        it('does not modify `recentBlockhash` when setting `lastValidBlockHeight`', () => {
            const currentRecentBlockhash = signedTx.recentBlockhash;
            signedTx.lastValidBlockHeight = 123;
            expect(currentRecentBlockhash).toBe(currentRecentBlockhash);
        });
        it('allows you to set a nonce lifetime by assigning nonce information to the `nonceInfo` property', () => {
            signedTx.nonceInfo = {
                nonce: '8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR',
                nonceInstruction: {
                    keys: [
                        { pubkey: { toBase58: () => '11111111111111111111111111111112' } as unknown as PublicKey },
                        { pubkey: { toBase58: () => 'SysvarRecentB1ockHashes11111111111111111111' } },
                        { pubkey: { toBase58: () => '11111111111111111111111111111113' } as unknown as PublicKey },
                    ],
                } as unknown as NonceInformation['nonceInstruction'],
            };
            expect(signedTx.serialize()).toEqual(
                // prettier-ignore
                expect.objectContaining([
                    /** SIGNATURES */
                    2, // Length of signatures array
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,

                    /** MESSAGE HEADER */
                    2, // numSignerAccounts
                    1, // numReadonlySignerAccount
                    2, // numReadonlyNonSignerAccounts

                    /** STATIC ADDRESSES */
                    5, // Number of static accounts
                    11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
                    167, 213, 23, 25, 44, 86, 142, 224, 138, 132, 95, 115, 210, 151, 136, 207, 3, 92, 49, 69, 178, 26, 179, 68, 216, 6, 46, 169, 64, 0, 0,

                    /** TRANSACTION LIFETIME TOKEN (ie. the nonce) */
                    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,

                    /* INSTRUCTIONS */
                    1, // Number of instructions
                        // First instruction
                        3, // Program address index
                        3, // Number of address indices
                        2, 4, 1, // Address indices
                        4, // Length of instruction data
                            4, 0, 0, 0, // (nonce advance)
                ]),
            );
        });
        it('serializes the transaction', () => {
            expect(signedTx.serialize()).toEqual(
                expect.objectContaining([
                    /** SIGNATURES */
                    1, // Length of signatures array
                    ...MOCK_SIGNATURE,

                    ...TRANSACTION_MESSAGE_IN_WIRE_FORMAT,
                ]),
            );
        });
        it('`serialize` does not fatal when `requireAllSignatures` is `true`', () => {
            expect(() => {
                signedTx.serialize({ requireAllSignatures: true });
            }).not.toThrow();
        });
        it('`serialize` fatals when `verifySignatures` is `true`', () => {
            expect(() => {
                signedTx.serialize({ verifySignatures: true });
            }).toThrow('The `verifySignatures` option of `Transaction#serialize` is unimplemented');
        });
    });
    describe('given an unsigned transaction', () => {
        let unsignedTx: Transaction;
        beforeEach(() => {
            unsignedTx = Transaction.from(
                new Uint8Array([
                    /** SIGNATURES */
                    0, // Length of signatures array

                    ...TRANSACTION_MESSAGE_IN_WIRE_FORMAT,
                ]),
            );
        });
        it('vends null for an unsigned transaction through the `signature` property', () => {
            expect(unsignedTx).toHaveProperty('signature', null);
        });
        it('serializes the transaction', () => {
            expect(unsignedTx.serialize()).toEqual(
                expect.objectContaining([
                    /** SIGNATURES */
                    1, // Length of signatures array
                    ...new Uint8Array(64),

                    ...TRANSACTION_MESSAGE_IN_WIRE_FORMAT,
                ]),
            );
        });
        it('`serialize` fatals when `requireAllSignatures` is `true`', () => {
            expect(() => {
                unsignedTx.serialize({ requireAllSignatures: true });
            }).toThrow();
        });
    });
});
