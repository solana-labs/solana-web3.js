import { Base58EncodedAddress } from '@solana/addresses';
import {
    BaseTransaction,
    Blockhash,
    createTransaction,
    setTransactionFeePayer,
    setTransactionLifetimeUsingBlockhash,
} from '@solana/transactions';

import { pipe } from '../pipe';

const feePayer =
    '2eTCZxWZkU5h3Mo162gLRTECzuJhPgC1McB9rCcoqNm2' as Base58EncodedAddress<'2eTCZxWZkU5h3Mo162gLRTECzuJhPgC1McB9rCcoqNm2'>;
const secondFeePayer =
    '6JkwLherbVYPVF5sXGHm7qd9Lpd6gzinU4P792FkgdfS' as Base58EncodedAddress<'6JkwLherbVYPVF5sXGHm7qd9Lpd6gzinU4P792FkgdfS'>;

const blockhashLifetime = { blockhash: '111' as Blockhash, lastValidBlockHeight: 5n };
const secondBlockhashLifetime = { blockhash: '222' as Blockhash, lastValidBlockHeight: 8n };

// The generic below is needed to shut TypeScript up and infer the proper return type.
function setFeePayer<T extends BaseTransaction>(tx: T) {
    return setTransactionFeePayer(feePayer, tx);
}

// The generic below is needed to shut TypeScript up and infer the proper return type.
function setFeePayerAgain<T extends BaseTransaction>(tx: T) {
    return setTransactionFeePayer(secondFeePayer, tx);
}

// The generic below is needed to shut TypeScript up and infer the proper return type.
function setBlockhash<T extends BaseTransaction>(tx: T) {
    return setTransactionLifetimeUsingBlockhash(blockhashLifetime, tx);
}

// The generic below is needed to shut TypeScript up and infer the proper return type.
function setBlockhashAgain<T extends BaseTransaction>(tx: T) {
    return setTransactionLifetimeUsingBlockhash(secondBlockhashLifetime, tx);
}

describe('`pipe`', () => {
    describe('using `pipe()` with pre-built setup functions', () => {
        it('can create a transaction', () => {
            expect.assertions(2);
            const tx1 = pipe(
                //
                createTransaction({ version: 'legacy' })
            );
            const tx2 = pipe(
                //
                createTransaction({ version: 0 })
            );
            expect(tx1.version).toBe('legacy');
            expect(tx2.version).toBe(0);
        });
        it('can create a transaction and set the fee payer', () => {
            expect.assertions(2);
            const tx = pipe(
                //
                createTransaction({ version: 'legacy' }),
                setFeePayer
            );
            expect(tx.version).toBe('legacy');
            expect(tx.feePayer).toBe(feePayer);
        });
        it('can create a transaction and set a recent blockhash', () => {
            expect.assertions(4);
            const tx1 = pipe(
                //
                createTransaction({ version: 'legacy' }),
                setBlockhash
            );
            const tx2 = pipe(
                //
                createTransaction({ version: 0 }),
                setBlockhash
            );
            expect(tx1.version).toBe('legacy');
            expect(tx1.lifetimeConstraint).toBe(blockhashLifetime);
            expect(tx2.version).toBe(0);
            expect(tx2.lifetimeConstraint).toBe(blockhashLifetime);
        });
        it('can create a transaction, set the fee payer, then set a recent blockhash', () => {
            expect.assertions(3);
            const tx = pipe(
                //
                createTransaction({ version: 'legacy' }),
                setFeePayer,
                setBlockhash
            );
            expect(tx.version).toBe('legacy');
            expect(tx.feePayer).toBe(feePayer);
            expect(tx.lifetimeConstraint).toBe(blockhashLifetime);
        });
        it('can create a transaction, set a recent blockhash, then set the fee payer', () => {
            expect.assertions(3);
            const tx = pipe(
                //
                createTransaction({ version: 'legacy' }),
                setBlockhash,
                setFeePayer
            );
            expect(tx.version).toBe('legacy');
            expect(tx.lifetimeConstraint).toBe(blockhashLifetime);
            expect(tx.feePayer).toBe(feePayer);
        });
        describe('when more than one fee payer is set in the same pipe', () => {
            it('uses the last fee payer', () => {
                expect.assertions(3);
                const tx = pipe(
                    //
                    createTransaction({ version: 'legacy' }),
                    setFeePayer,
                    setBlockhash,
                    setFeePayerAgain
                );
                expect(tx.version).toBe('legacy');
                expect(tx.lifetimeConstraint).toBe(blockhashLifetime);
                expect(tx.feePayer).toBe(secondFeePayer);
            });
        });
        describe('when more than one blockhash is set in the same pipe', () => {
            it('uses the last blockhash', () => {
                expect.assertions(3);
                const tx = pipe(
                    //
                    createTransaction({ version: 'legacy' }),
                    setBlockhash,
                    setFeePayer,
                    setBlockhashAgain
                );
                expect(tx.version).toBe('legacy');
                expect(tx.lifetimeConstraint).toBe(secondBlockhashLifetime);
                expect(tx.feePayer).toBe(feePayer);
            });
        });
    });

    describe('using `pipeTransaction()` with arrow functions', () => {
        it('can create a transaction and set the fee payer', () => {
            expect.assertions(2);
            const tx = pipe(
                //
                createTransaction({ version: 'legacy' }),
                tx => setTransactionFeePayer(feePayer, tx)
            );
            expect(tx.version).toBe('legacy');
            expect(tx.feePayer).toBe(feePayer);
        });
        it('can create a transaction and set a recent blockhash', () => {
            expect.assertions(2);
            const tx = pipe(
                //
                createTransaction({ version: 'legacy' }),
                tx => setTransactionLifetimeUsingBlockhash(blockhashLifetime, tx)
            );
            expect(tx.version).toBe('legacy');
            expect(tx.lifetimeConstraint).toBe(blockhashLifetime);
        });

        it('can create a transaction, set the fee payer, then set a recent blockhash', () => {
            expect.assertions(3);
            const tx = pipe(
                //
                createTransaction({ version: 'legacy' }),
                tx => setTransactionFeePayer(feePayer, tx),
                tx => setTransactionLifetimeUsingBlockhash(blockhashLifetime, tx)
            );
            expect(tx.version).toBe('legacy');
            expect(tx.feePayer).toBe(feePayer);
            expect(tx.lifetimeConstraint).toBe(blockhashLifetime);
        });
        it('can create a transaction, set a recent blockhash, then set the fee payer', () => {
            expect.assertions(3);
            const tx = pipe(
                //
                createTransaction({ version: 'legacy' }),
                tx => setTransactionLifetimeUsingBlockhash(blockhashLifetime, tx),
                tx => setTransactionFeePayer(feePayer, tx)
            );
            expect(tx.version).toBe('legacy');
            expect(tx.lifetimeConstraint).toBe(blockhashLifetime);
            expect(tx.feePayer).toBe(feePayer);
        });
        describe('when more than one fee payer is set in the same pipe', () => {
            it('uses the last fee payer', () => {
                expect.assertions(3);
                const tx = pipe(
                    //
                    createTransaction({ version: 'legacy' }),
                    tx => setTransactionFeePayer(feePayer, tx),
                    tx => setTransactionLifetimeUsingBlockhash(blockhashLifetime, tx),
                    tx => setTransactionFeePayer(secondFeePayer, tx)
                );
                expect(tx.version).toBe('legacy');
                expect(tx.lifetimeConstraint).toBe(blockhashLifetime);
                expect(tx.feePayer).toBe(secondFeePayer);
            });
        });
        describe('when more than one blockhash is set in the same pipe', () => {
            it('uses the last blockhash', () => {
                expect.assertions(3);
                const tx = pipe(
                    //
                    createTransaction({ version: 'legacy' }),
                    tx => setTransactionLifetimeUsingBlockhash(blockhashLifetime, tx),
                    tx => setTransactionFeePayer(feePayer, tx),
                    tx => setTransactionLifetimeUsingBlockhash(secondBlockhashLifetime, tx)
                );
                expect(tx.version).toBe('legacy');
                expect(tx.lifetimeConstraint).toBe(secondBlockhashLifetime);
                expect(tx.feePayer).toBe(feePayer);
            });
        });
    });
});
