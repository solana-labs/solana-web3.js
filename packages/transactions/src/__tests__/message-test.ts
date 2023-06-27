import { Base58EncodedAddress } from '@solana/keys';

import { ITransactionWithBlockhashLifetime } from '../blockhash';
import { getCompiledLifetimeToken } from '../compile-lifetime-token';
import { ITransactionWithFeePayer } from '../fee-payer';
import { compileMessage } from '../message';
import { BaseTransaction } from '../types';

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
});
