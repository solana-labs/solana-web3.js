import { Address } from '@solana/addresses';

import { ITransactionWithBlockhashLifetime } from '../blockhash.js';
import { getCompiledAddressTableLookups } from '../compile-address-table-lookups.js';
import { getCompiledMessageHeader } from '../compile-header.js';
import { getCompiledInstructions } from '../compile-instructions.js';
import { getCompiledLifetimeToken } from '../compile-lifetime-token.js';
import { getCompiledStaticAccounts } from '../compile-static-accounts.js';
import { ITransactionWithFeePayer } from '../fee-payer.js';
import { compileMessage } from '../message.js';
import { BaseTransaction } from '../types.js';

jest.mock('../compile-address-table-lookups');
jest.mock('../compile-header');
jest.mock('../compile-instructions');
jest.mock('../compile-lifetime-token');
jest.mock('../compile-static-accounts');

const MOCK_LIFETIME_CONSTRAINT =
    'SOME_CONSTRAINT' as unknown as ITransactionWithBlockhashLifetime['lifetimeConstraint'];

describe('compileMessage', () => {
    let baseTx: BaseTransaction & ITransactionWithBlockhashLifetime & ITransactionWithFeePayer;
    beforeEach(() => {
        baseTx = {
            feePayer: 'abc' as Address<'abc'>,
            instructions: [],
            lifetimeConstraint: MOCK_LIFETIME_CONSTRAINT,
            version: 0,
        };
    });
    describe('address table lookups', () => {
        const expectedAddressTableLookups = [] as ReturnType<typeof getCompiledAddressTableLookups>;
        beforeEach(() => {
            jest.mocked(getCompiledAddressTableLookups).mockReturnValue(expectedAddressTableLookups);
        });
        describe("when the transaction version is `'legacy'`", () => {
            let legacyBaseTx: Readonly<{ version: 'legacy' }> & typeof baseTx;
            beforeEach(() => {
                legacyBaseTx = { ...baseTx, version: 'legacy' };
            });
            it('does not set `addressTableLookups`', () => {
                const message = compileMessage(legacyBaseTx);
                expect(message).not.toHaveProperty('addressTableLookups');
            });
            it('does not call `getCompiledAddressTableLookups`', () => {
                compileMessage(legacyBaseTx);
                expect(getCompiledAddressTableLookups).not.toHaveBeenCalled();
            });
        });
        it('sets `addressTableLookups` to the return value of `getCompiledAddressTableLookups`', () => {
            const message = compileMessage(baseTx);
            expect(getCompiledAddressTableLookups).toHaveBeenCalled();
            expect(message.addressTableLookups).toBe(expectedAddressTableLookups);
        });
    });
    describe('message header', () => {
        const expectedCompiledMessageHeader = {
            numReadonlyNonSignerAccounts: 0,
            numReadonlySignerAccounts: 0,
            numSignerAccounts: 1,
        } as const;
        beforeEach(() => {
            jest.mocked(getCompiledMessageHeader).mockReturnValue(expectedCompiledMessageHeader);
        });
        it('sets `header` to the return value of `getCompiledMessageHeader`', () => {
            const message = compileMessage(baseTx);
            expect(getCompiledMessageHeader).toHaveBeenCalled();
            expect(message.header).toBe(expectedCompiledMessageHeader);
        });
    });
    describe('instructions', () => {
        const expectedInstructions = [] as ReturnType<typeof getCompiledInstructions>;
        beforeEach(() => {
            jest.mocked(getCompiledInstructions).mockReturnValue(expectedInstructions);
        });
        it('sets `instructions` to the return value of `getCompiledInstructions`', () => {
            const message = compileMessage(baseTx);
            expect(getCompiledInstructions).toHaveBeenCalledWith(
                baseTx.instructions,
                expect.any(Array) /* orderedAccounts */,
            );
            expect(message.instructions).toBe(expectedInstructions);
        });
    });
    describe('lifetime constraints', () => {
        beforeEach(() => {
            jest.mocked(getCompiledLifetimeToken).mockReturnValue('abc');
        });
        it('sets `lifetimeToken` to the return value of `getCompiledLifetimeToken`', () => {
            const message = compileMessage(baseTx);
            expect(getCompiledLifetimeToken).toHaveBeenCalledWith('SOME_CONSTRAINT');
            expect(message.lifetimeToken).toBe('abc');
        });
    });
    describe('static accounts', () => {
        const expectedStaticAccounts = [] as ReturnType<typeof getCompiledStaticAccounts>;
        beforeEach(() => {
            jest.mocked(getCompiledStaticAccounts).mockReturnValue(expectedStaticAccounts);
        });
        it('sets `staticAccounts` to the return value of `getCompiledStaticAccounts`', () => {
            const message = compileMessage(baseTx);
            expect(getCompiledStaticAccounts).toHaveBeenCalled();
            expect(message.staticAccounts).toBe(expectedStaticAccounts);
        });
    });
    describe('versions', () => {
        it('compiles the version', () => {
            const message = compileMessage(baseTx);
            expect(message).toHaveProperty('version', 0);
        });
    });
});
