import { createDefaultRpc } from '../rpc';
import { SolanaJsonRpcIntegerOverflowError } from '../rpc-integer-overflow-error';

import { SolanaJsonRpcApi } from '@solana/rpc-core';
import { Transport } from '@solana/rpc-transport/dist/types/json-rpc-transport/json-rpc-transport-types';

describe('RPC', () => {
    let transport: Transport<SolanaJsonRpcApi>;
    beforeEach(() => {
        transport = createDefaultRpc('fake://url');
    });
    describe('with respect to integer overflows', () => {
        it('does not throw when called with a value up to `Number.MAX_SAFE_INTEGER`', () => {
            expect(() => {
                transport.getBlocks(BigInt(Number.MAX_SAFE_INTEGER));
            }).not.toThrow();
        });
        it('does not throw when called with a value up to `-Number.MAX_SAFE_INTEGER`', () => {
            expect(() => {
                transport.getBlocks(BigInt(-Number.MAX_SAFE_INTEGER));
            }).not.toThrow();
        });
        it('throws when called with a value greater than `Number.MAX_SAFE_INTEGER`', () => {
            expect(() => {
                transport.getBlocks(BigInt(Number.MAX_SAFE_INTEGER) + 1n);
            }).toThrow(SolanaJsonRpcIntegerOverflowError);
        });
        it('throws when called with a value less than `-Number.MAX_SAFE_INTEGER`', () => {
            expect(() => {
                transport.getBlocks(BigInt(-Number.MAX_SAFE_INTEGER) - 1n);
            }).toThrow(SolanaJsonRpcIntegerOverflowError);
        });
    });
});
