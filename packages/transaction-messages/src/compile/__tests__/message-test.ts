import { Address } from '@solana/addresses';

import { ITransactionMessageWithBlockhashLifetime } from '../../blockhash';
import { CompilableTransactionMessage } from '../../compilable-transaction-message';
import { getCompiledAddressTableLookups } from '../address-table-lookups';
import { getCompiledMessageHeader } from '../header';
import { getCompiledInstructions } from '../instructions';
import { getCompiledLifetimeToken } from '../lifetime-token';
import { newCompileTransactionMessage } from '../message';
import { getCompiledStaticAccounts } from '../static-accounts';

jest.mock('../address-table-lookups');
jest.mock('../header');
jest.mock('../instructions');
jest.mock('../lifetime-token');
jest.mock('../static-accounts');

const MOCK_LIFETIME_CONSTRAINT =
    'SOME_CONSTRAINT' as unknown as ITransactionMessageWithBlockhashLifetime['lifetimeConstraint'];

describe('compileTransactionMessage', () => {
    let baseTx: CompilableTransactionMessage;
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
                const message = newCompileTransactionMessage(legacyBaseTx);
                expect(message).not.toHaveProperty('addressTableLookups');
            });
            it('does not call `getCompiledAddressTableLookups`', () => {
                newCompileTransactionMessage(legacyBaseTx);
                expect(getCompiledAddressTableLookups).not.toHaveBeenCalled();
            });
        });
        it('sets `addressTableLookups` to the return value of `getCompiledAddressTableLookups`', () => {
            const message = newCompileTransactionMessage(baseTx);
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
            const message = newCompileTransactionMessage(baseTx);
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
            const message = newCompileTransactionMessage(baseTx);
            console.log({ message });
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
            const message = newCompileTransactionMessage(baseTx);
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
            const message = newCompileTransactionMessage(baseTx);
            expect(getCompiledStaticAccounts).toHaveBeenCalled();
            expect(message.staticAccounts).toBe(expectedStaticAccounts);
        });
    });
    describe('versions', () => {
        it('compiles the version', () => {
            const message = newCompileTransactionMessage(baseTx);
            expect(message).toHaveProperty('version', 0);
        });
    });
});
