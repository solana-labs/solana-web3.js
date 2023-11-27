import { PublicKey } from '../public-key';
import { Transaction } from '../transaction';

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
            Transaction[method]()
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
                ])
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
            'serialize',
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
        it.each(['instructions', 'signatures'] as (keyof Transaction)[])('fatals when accessing `%s`', property => {
            expect(() => {
                signedTx[property];
            }).toThrow(`Transaction#${property} (getter) is unimplemented`);
        });
        it('vends the `PublicKey` of the fee payer through the `feePayer` property', () => {
            expect(signedTx.feePayer).toEqual(new PublicKey('k7FaK87WHGVXzkaoHb7CdVPgkKDQhZ29VLDeBVbDfYn'));
        });
        it('allows you to set the fee payer by assigning a `PublicKey` to the `feePayer` property', () => {
            signedTx.feePayer = new PublicKey('8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR');
            expect(signedTx.feePayer).toEqual(new PublicKey('8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR'));
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
                ])
            );
        });
        it('vends null for an unsigned transaction through the `signature` property', () => {
            expect(unsignedTx).toHaveProperty('signature', null);
        });
    });
});
