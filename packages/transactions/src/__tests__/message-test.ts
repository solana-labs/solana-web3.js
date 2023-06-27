import { Base58EncodedAddress } from '@solana/keys';

import { ITransactionWithBlockhashLifetime } from '../blockhash';
import { getCompiledMessageHeader } from '../compile-header';
import { getCompiledLifetimeToken } from '../compile-lifetime-token';
import { ITransactionWithFeePayer } from '../fee-payer';
import { compileMessage } from '../message';
import { BaseTransaction } from '../types';

jest.mock('../compile-header');
jest.mock('../compile-lifetime-token');

const MOCK_LIFETIME_CONSTRAINT =
    'SOME_CONSTRAINT' as unknown as ITransactionWithBlockhashLifetime['lifetimeConstraint'];

describe('compileMessage', () => {
    let baseTx: BaseTransaction & ITransactionWithFeePayer & ITransactionWithBlockhashLifetime;
    beforeEach(() => {
        baseTx = {
            feePayer: 'abc' as Base58EncodedAddress<'abc'>,
            instructions: [],
            lifetimeConstraint: MOCK_LIFETIME_CONSTRAINT,
            version: 0,
        };
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
    describe('versions', () => {
        it('compiles the version', () => {
            const message = compileMessage(baseTx);
            expect(message).toHaveProperty('version', 0);
        });
    });
});
