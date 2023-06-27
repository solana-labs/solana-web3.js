import { Blockhash } from '@solana/rpc-core';

import { getCompiledLifetimeToken } from '../compile-lifetime-token';

describe('getCompiledLifetimeToken', () => {
    it('compiles a recent blockhash lifetime constraint', () => {
        const token = getCompiledLifetimeToken({
            blockhash: 'abc' as Blockhash,
            lastValidBlockHeight: 100n,
        });
        expect(token).toBe('abc');
    });
    it('compiles a nonce lifetime constraint', () => {
        const token = getCompiledLifetimeToken({
            nonce: 'abc',
        });
        expect(token).toBe('abc');
    });
});
