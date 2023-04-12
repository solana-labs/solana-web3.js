import { createJsonRpcTransport } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-transport/json-rpc-errors';
import type { Transport } from '@solana/rpc-transport/dist/types/json-rpc-transport/json-rpc-transport-types';
import fetchMock from 'jest-fetch-mock';
import { createSolanaRpcApi, SolanaRpcMethods } from '../../index';
import { Commitment } from '../common';
import { Base58EncodedAddress } from '@solana/keys';

describe('getBalance', () => {
    let transport: Transport<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        transport = createJsonRpcTransport({
            api: createSolanaRpcApi(),
            url: 'http://127.0.0.1:8899',
        });
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns a balance of zero for a new address', async () => {
                expect.assertions(1);
                // This key is random, don't re-use in any tests that affect balance
                const publicKey = '4BfxgLzn6pEuVB2ynBMqckHFdYD8VNcrheDFFCB6U5TH' as Base58EncodedAddress;
                const balancePromise = transport.getBalance(publicKey).send();
                await expect(balancePromise).resolves.toHaveProperty('value', BigInt(0));
            });
        });
    });

    describe('given an account with a non-zero balance', () => {
        // See scripts/fixtures/4nTLDQiSTRHbngKZWPMfYnZdWTbKiNeuuPcX7yFUpSAc.json
        const publicKey = '4nTLDQiSTRHbngKZWPMfYnZdWTbKiNeuuPcX7yFUpSAc' as Base58EncodedAddress;
        it('returns the correct balance', async () => {
            expect.assertions(1);
            const balancePromise = transport.getBalance(publicKey).send();
            await expect(balancePromise).resolves.toHaveProperty('value', BigInt(5_000_000));
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            // This key is random, don't re-use in any tests that affect balance
            const publicKey = '4BfxgLzn6pEuVB2ynBMqckHFdYD8VNcrheDFFCB6U5TH' as Base58EncodedAddress;
            const sendPromise = transport
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
