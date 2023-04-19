import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';
import { SolanaRpcMethods, createSolanaRpcApi } from '../../index';
import { Commitment } from '../common';

describe('getBigInt', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });
    const supportCommitment = ['getStakeMinimumDelegation'];
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it.each(supportCommitment)('returns the result as a bigint wrapped in an RpcResponse', async funcName => {
                expect.assertions(1);
                const result = await Reflect.get(rpc, funcName)({ commitment }).send();
                expect(result.value).toEqual(expect.any(BigInt));
            });
        });
    });
    const supportCommitmentAndContext = ['getSlot', 'getBlockHeight', 'getTransactionCount'];
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it.each(supportCommitmentAndContext)('returns the result as a bigint', async funcName => {
                expect.assertions(1);
                const result = await Reflect.get(rpc, funcName)({ commitment }).send();
                expect(result).toEqual(expect.any(BigInt));
            });
        });
    });
    describe('when called with a `minContextSlot` of 0', () => {
        it.each(supportCommitmentAndContext)('returns the result as a bigint', async funcName => {
            expect.assertions(1);
            const result = await Reflect.get(rpc, funcName)({ minContextSlot: 0n }).send();
            expect(result).toEqual(expect.any(BigInt));
        });
    });
    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it.each(supportCommitmentAndContext)('throws an error', async funcName => {
            expect.assertions(1);
            const sendPromise = Reflect.get(
                rpc,
                funcName
            )({
                minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
            }).send();
            await expect(sendPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });
    const supportNoParameters = [
        'getFirstAvailableBlock',
        'getMaxRetransmitSlot',
        'getMaxShredInsertSlot',
        'minimumLedgerSlot',
    ];
    describe('when called with no parameters', () => {
        it.each(supportNoParameters)('returns a bigint', async funcName => {
            expect.assertions(1);
            const result = await Reflect.get(rpc, funcName)().send();
            expect(result).toEqual(expect.any(BigInt));
        });
    });
});
