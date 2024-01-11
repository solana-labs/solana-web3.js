import type { Blockhash } from '@solana/rpc-types';

import { getCompiledLifetimeToken } from '../compile-lifetime-token';
import { Nonce } from '../durable-nonce';

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
            nonce: 'abc' as Nonce,
        });
        expect(token).toBe('abc');
    });
});
