import { Base58EncodedAddress } from '@solana/addresses';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { Commitment } from '../common';
import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

// See scripts/fixtures/spl-token-token-account.json
const tokenAccountAddress = 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca' as Base58EncodedAddress;

describe('getTokenAccountBalance', () => {
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
            it('returns token account balance', async () => {
                expect.assertions(1);
                const tokenAccountBalancePromise = rpc
                    .getTokenAccountBalance(tokenAccountAddress, { commitment })
                    .send();
                await expect(tokenAccountBalancePromise).resolves.toMatchObject({
                    context: {
                        slot: expect.any(BigInt),
                    },
                    value: {
                        amount: expect.any(String),
                        decimals: expect.any(Number),
                        // This can be Number or null, but we're using a fixture so it should be Number
                        uiAmount: expect.any(Number),
                        uiAmountString: expect.any(String),
                    },
                });
            });
        });
    });

    describe('when called with an account that is not a token account', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const stakeActivationPromise = rpc
                .getTokenAccountBalance(
                    // Randomly generated
                    'BnWCFuxmi6uH3ceVx4R8qcbWBMPVVYVVFWtAiiTA1PAu' as Base58EncodedAddress
                )
                .send();
            await expect(stakeActivationPromise).rejects.toMatchObject({
                code: -32602 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });
});
