import 'test-matchers/toBeFrozenObject';

import { AccountRole, ReadonlySignerAccount, WritableAccount } from '@solana/instructions';
import { Base58EncodedAddress } from '@solana/keys';

import { Blockhash, ITransactionWithBlockhashLifetime } from '../blockhash';
import { assertIsDurableNonceTransaction, IDurableNonceTransaction, Nonce } from '../durable-nonce';
import { BaseTransaction } from '../types';

function createMockAdvanceNonceAccountInstruction<
    TNonceAccountAddress extends string = string,
    TNonceAuthorityAddress extends string = string
>({
    nonceAccountAddress,
    nonceAuthorityAddress,
}: {
    nonceAccountAddress: Base58EncodedAddress<TNonceAccountAddress>;
    nonceAuthorityAddress: Base58EncodedAddress<TNonceAuthorityAddress>;
}): IDurableNonceTransaction['instructions'][0] {
    return {
        accounts: [
            { address: nonceAccountAddress, role: AccountRole.WRITABLE } as WritableAccount<TNonceAccountAddress>,
            {
                address:
                    'SysvarRecentB1ockHashes11111111111111111111' as Base58EncodedAddress<'SysvarRecentB1ockHashes11111111111111111111'>,
                role: AccountRole.READONLY,
            },
            {
                address: nonceAuthorityAddress,
                role: AccountRole.READONLY_SIGNER,
            } as ReadonlySignerAccount<TNonceAuthorityAddress>,
        ],
        data: new Uint8Array([4, 0, 0, 0]) as IDurableNonceTransaction['instructions'][0]['data'],
        programAddress: '11111111111111111111111111111111' as Base58EncodedAddress<'11111111111111111111111111111111'>,
    };
}

describe('assertIsDurableNonceTransaction()', () => {
    let durableNonceTx: BaseTransaction & IDurableNonceTransaction;
    const NONCE_CONSTRAINT = {
        nonce: '123' as Nonce,
        nonceAccountAddress: '123' as Base58EncodedAddress,
        nonceAuthorityAddress: '123' as Base58EncodedAddress,
    };
    beforeEach(() => {
        durableNonceTx = {
            instructions: [createMockAdvanceNonceAccountInstruction(NONCE_CONSTRAINT)],
            lifetimeConstraint: { nonce: NONCE_CONSTRAINT.nonce } as IDurableNonceTransaction['lifetimeConstraint'],
            version: 0,
        } as const;
    });
    it('throws when supplied a transaction with a nonce lifetime constraint but no instructions', () => {
        expect(() => {
            assertIsDurableNonceTransaction({
                ...durableNonceTx,
                instructions: [],
            });
        }).toThrow();
    });
    it('throws when supplied a transaction with a nonce lifetime constraint but an instruction at index 0 for a program other than the system program', () => {
        expect(() => {
            assertIsDurableNonceTransaction({
                ...durableNonceTx,
                instructions: [
                    {
                        ...durableNonceTx.instructions[0],
                        programAddress: '32JTd9jz5xGuLegzVouXxfzAVTiJYWMLrg6p8RxbV5xc' as Base58EncodedAddress,
                    },
                ],
                lifetimeConstraint: { nonce: NONCE_CONSTRAINT.nonce } as IDurableNonceTransaction['lifetimeConstraint'],
            });
        }).toThrow();
    });
    it('throws when supplied a transaction with a nonce lifetime constraint but a system program instruction at index 0 for something other than the `AdvanceNonceAccount` instruction', () => {
        expect(() => {
            assertIsDurableNonceTransaction({
                ...durableNonceTx,
                instructions: [
                    {
                        ...durableNonceTx.instructions[0],
                        data: new Uint8Array([2, 0, 0, 0]), // Transfer instruction
                    },
                ],
                lifetimeConstraint: { nonce: NONCE_CONSTRAINT.nonce } as IDurableNonceTransaction['lifetimeConstraint'],
            });
        }).toThrow();
    });
    it('throws when supplied a transaction with a nonce lifetime constraint but a system program instruction at index 0 with malformed accounts', () => {
        expect(() => {
            assertIsDurableNonceTransaction({
                ...durableNonceTx,
                instructions: [
                    {
                        ...durableNonceTx.instructions[0],
                        accounts: [],
                    },
                ],
                lifetimeConstraint: { nonce: NONCE_CONSTRAINT.nonce } as IDurableNonceTransaction['lifetimeConstraint'],
            });
        }).toThrow();
    });
    it('throws when supplied a transaction with an `AdvanceNonceAccount` instruction at index 0 but no lifetime constraint', () => {
        expect(() => {
            assertIsDurableNonceTransaction({
                ...durableNonceTx,
                lifetimeConstraint: undefined,
            });
        }).toThrow();
    });
    it('throws when supplied a transaction with an `AdvanceNonceAccount` instruction at index 0 but a blockhash lifetime constraint', () => {
        expect(() => {
            assertIsDurableNonceTransaction({
                ...durableNonceTx,
                lifetimeConstraint: {
                    blockhash: '123' as Blockhash,
                    lastValidBlockHeight: 123n,
                } as ITransactionWithBlockhashLifetime['lifetimeConstraint'],
            } as BaseTransaction);
        }).toThrow();
    });
    it('does not throw when supplied a durable nonce transaction', () => {
        expect(() => {
            assertIsDurableNonceTransaction({ ...durableNonceTx });
        }).not.toThrow();
    });
});
