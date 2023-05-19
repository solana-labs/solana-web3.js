import { IRpcTransport } from '@solana/rpc-transport/dist/types/transports/transport-types';

import { createSolanaRpc } from '../rpc';
import { SolanaJsonRpcIntegerOverflowError } from '../rpc-integer-overflow-error';

describe('RPC integer overflow behavior', () => {
    let rpc: ReturnType<typeof createSolanaRpc>;
    beforeEach(() => {
        const transport = jest.fn(
            () =>
                new Promise(_ => {
                    /* never resolve */
                })
        ) as IRpcTransport;
        rpc = createSolanaRpc({ transport });
    });
    it('does not throw when called with a value up to `Number.MAX_SAFE_INTEGER`', () => {
        expect(() => {
            rpc.getBlocks(BigInt(Number.MAX_SAFE_INTEGER));
        }).not.toThrow();
    });
    it('does not throw when called with a value up to `-Number.MAX_SAFE_INTEGER`', () => {
        expect(() => {
            rpc.getBlocks(BigInt(-Number.MAX_SAFE_INTEGER));
        }).not.toThrow();
    });
    it('throws when called with a value greater than `Number.MAX_SAFE_INTEGER`', () => {
        expect(() => {
            rpc.getBlocks(BigInt(Number.MAX_SAFE_INTEGER) + 1n);
        }).toThrow(SolanaJsonRpcIntegerOverflowError);
    });
    it('throws when called with a value less than `-Number.MAX_SAFE_INTEGER`', () => {
        expect(() => {
            rpc.getBlocks(BigInt(-Number.MAX_SAFE_INTEGER) - 1n);
        }).toThrow(SolanaJsonRpcIntegerOverflowError);
    });
});
