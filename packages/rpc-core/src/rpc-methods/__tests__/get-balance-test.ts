import { Address } from '@solana/addresses';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { Commitment } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getBalance', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns a balance of zero for a new address', async () => {
                expect.assertions(1);
                // This key is random, don't re-use in any tests that affect balance
                const publicKey =
                    '4BfxgLzn6pEuVB2ynBMqckHFdYD8VNcrheDFFCB6U5TH' as Address<'4BfxgLzn6pEuVB2ynBMqckHFdYD8VNcrheDFFCB6U5TH'>;
                const balancePromise = rpc.getBalance(publicKey).send();
                await expect(balancePromise).resolves.toHaveProperty('value', BigInt(0));
            });
        });
    });

    describe('given an account with a non-zero balance', () => {
        // See scripts/fixtures/4nTLDQiSTRHbngKZWPMfYnZdWTbKiNeuuPcX7yFUpSAc.json
        const publicKey =
            '4nTLDQiSTRHbngKZWPMfYnZdWTbKiNeuuPcX7yFUpSAc' as Address<'4nTLDQiSTRHbngKZWPMfYnZdWTbKiNeuuPcX7yFUpSAc'>;
        it('returns the correct balance', async () => {
            expect.assertions(1);
            const balancePromise = rpc.getBalance(publicKey).send();
            await expect(balancePromise).resolves.toHaveProperty('value', BigInt(5_000_000));
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            // This key is random, don't re-use in any tests that affect balance
            const publicKey =
                '4BfxgLzn6pEuVB2ynBMqckHFdYD8VNcrheDFFCB6U5TH' as Address<'4BfxgLzn6pEuVB2ynBMqckHFdYD8VNcrheDFFCB6U5TH'>;
            const sendPromise = rpc
                .getBalance(publicKey, {
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await expect(sendPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });
});
