import type { Rpc } from '@solana/rpc-spec';
import { RpcError } from '@solana/rpc-spec-types';
import type { Commitment, SolanaRpcErrorCode } from '@solana/rpc-types';

import { GetBlockHeightApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getBlockHeight', () => {
    let rpc: Rpc<GetBlockHeightApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns the result as a bigint', async () => {
                expect.assertions(1);
                const result = await rpc.getBlockHeight({ commitment }).send();
                expect(result).toEqual(expect.any(BigInt));
            });
        });
    });
    describe('when called with a `minContextSlot` of 0', () => {
        it('returns the result as a bigint', async () => {
            expect.assertions(1);
            const result = await rpc.getBlockHeight({ minContextSlot: 0n }).send();
            expect(result).toEqual(expect.any(BigInt));
        });
    });
    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(2);
            const sendPromise = rpc
                .getBlockHeight({
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await expect(sendPromise).rejects.toThrow(RpcError);
            await expect(sendPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
            });
        });
    });
});
