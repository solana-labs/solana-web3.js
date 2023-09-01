// import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
// import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';
// import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

// These tests can't be run reliably since we can't predict where the ledger
// will be when this suite gets invoked.
// For example, if you call `getBlock` with slot `0` and the ledger has moved
// well beyond that, the test will fail because the block will be cleaned up.
// Also, we can't accurately determine when a block will be cleaned up.
describe('getBlock', () => {
    // let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        // rpc = createJsonRpc<SolanaRpcMethods>({
        //     api: createSolanaRpcApi(),
        //     transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        // });
    });

    describe('when `transactionDetails` is set to `full`', () => {
        describe('returns transactions with the correct shape', () => {
            it.todo('when called with json encoding and maxSupportedTransactionVersion is set');
            // it('when called with json encoding and maxSupportedTransactionVersion is set', async () => {
            //     expect.assertions(1);
            //     const getBlockPromise = rpc
            //         .getBlock(0n, { transactionDetails: 'full', encoding: 'json', maxSupportedTransactionVersion: 0 })
            //         .send();
            //     await expect(getBlockPromise).resolves.toMatchObject({
            //         blockhash: expect.any(String),
            //         blockHeight: expect.any(BigInt),
            //         blockTime: expect.any(Number),
            //         parentSlot: expect.any(BigInt),
            //         previousBlockhash: expect.any(String),
            //         transactions: expect.any(Array),
            //     });
            // });
            it.todo('when called with jsonParsed encoding and maxSupportedTransactionVersion is set');
            // it('when called with jsonParsed encoding and maxSupportedTransactionVersion is set', async () => {
            //     expect.assertions(1);
            //     const getBlockPromise = rpc
            //         .getBlock(0n, {
            //             transactionDetails: 'full',
            //             encoding: 'jsonParsed',
            //             maxSupportedTransactionVersion: 0,
            //         })
            //         .send();
            //     await expect(getBlockPromise).resolves.toMatchObject({
            //         blockhash: expect.any(String),
            //         blockHeight: expect.any(BigInt),
            //         blockTime: expect.any(Number),
            //         parentSlot: expect.any(BigInt),
            //         previousBlockhash: expect.any(String),
            //         transactions: expect.any(Array),
            //     });
            // });
            it.todo('when called with base58 encoding and maxSupportedTransactionVersion is set');
            // it('when called with base58 encoding and maxSupportedTransactionVersion is set', async () => {
            //     expect.assertions(1);
            //     const getBlockPromise = rpc
            //         .getBlock(0n, { transactionDetails: 'full', encoding: 'base58', maxSupportedTransactionVersion: 0 })
            //         .send();
            //     await expect(getBlockPromise).resolves.toMatchObject({
            //         blockhash: expect.any(String),
            //         blockHeight: expect.any(BigInt),
            //         blockTime: expect.any(Number),
            //         parentSlot: expect.any(BigInt),
            //         previousBlockhash: expect.any(String),
            //         transactions: expect.any(Array),
            //     });
            // });
            it.todo('when called with base64 encoding and maxSupportedTransactionVersion is set');
            // it('when called with base64 encoding and maxSupportedTransactionVersion is set', async () => {
            //     expect.assertions(1);
            //     const getBlockPromise = rpc
            //         .getBlock(0n, { transactionDetails: 'full', encoding: 'base64', maxSupportedTransactionVersion: 0 })
            //         .send();
            //     await expect(getBlockPromise).resolves.toMatchObject({
            //         blockhash: expect.any(String),
            //         blockHeight: expect.any(BigInt),
            //         blockTime: expect.any(Number),
            //         parentSlot: expect.any(BigInt),
            //         previousBlockhash: expect.any(String),
            //         transactions: expect.any(Array),
            //     });
            // });
            it.todo('when called with json encoding and maxSupportedTransactionVersion is not set');
            // it('when called with json encoding and maxSupportedTransactionVersion is not set', async () => {
            //     expect.assertions(1);
            //     const getBlockPromise = rpc.getBlock(0n, { transactionDetails: 'full', encoding: 'json' }).send();
            //     await expect(getBlockPromise).resolves.toMatchObject({
            //         blockhash: expect.any(String),
            //         blockHeight: expect.any(BigInt),
            //         blockTime: expect.any(Number),
            //         parentSlot: expect.any(BigInt),
            //         previousBlockhash: expect.any(String),
            //         transactions: expect.any(Array),
            //     });
            // });
            it.todo('when called with jsonParsed encoding and maxSupportedTransactionVersion is not set');
            // it('when called with jsonParsed encoding and maxSupportedTransactionVersion is not set', async () => {
            //     expect.assertions(1);
            //     const getBlockPromise = rpc.getBlock(0n, { transactionDetails: 'full', encoding: 'jsonParsed' }).send();
            //     await expect(getBlockPromise).resolves.toMatchObject({
            //         blockhash: expect.any(String),
            //         blockHeight: expect.any(BigInt),
            //         blockTime: expect.any(Number),
            //         parentSlot: expect.any(BigInt),
            //         previousBlockhash: expect.any(String),
            //         transactions: expect.any(Array),
            //     });
            // });
            it.todo('when called with base58 encoding and maxSupportedTransactionVersion is not set');
            // it('when called with base58 encoding and maxSupportedTransactionVersion is not set', async () => {
            //     expect.assertions(1);
            //     const getBlockPromise = rpc.getBlock(0n, { transactionDetails: 'full', encoding: 'base58' }).send();
            //     await expect(getBlockPromise).resolves.toMatchObject({
            //         blockhash: expect.any(String),
            //         blockHeight: expect.any(BigInt),
            //         blockTime: expect.any(Number),
            //         parentSlot: expect.any(BigInt),
            //         previousBlockhash: expect.any(String),
            //         transactions: expect.any(Array),
            //     });
            // });
            it.todo('when called with base64 encoding and maxSupportedTransactionVersion is not set');
            // it('when called with base64 encoding and maxSupportedTransactionVersion is not set', async () => {
            //     expect.assertions(1);
            //     const getBlockPromise = rpc.getBlock(0n, { transactionDetails: 'full', encoding: 'base64' }).send();
            //     await expect(getBlockPromise).resolves.toMatchObject({
            //         blockhash: expect.any(String),
            //         blockHeight: expect.any(BigInt),
            //         blockTime: expect.any(Number),
            //         parentSlot: expect.any(BigInt),
            //         previousBlockhash: expect.any(String),
            //         transactions: expect.any(Array),
            //     });
            // });
            it.todo('when called without additional config');
        });
    });

    describe('when `transactionDetails` is set to `accounts`', () => {
        describe('returns transactions with only signatures and an annotated list of accounts', () => {
            it.todo('when maxSupportedTransactionVersion is set');
            it.todo('when maxSupportedTransactionVersion is not set');
            it.todo('when called without additional config');
        });
    });

    describe('when `transactionDetails` is set to `signatures`', () => {
        describe('returns transactions with only signatures', () => {
            it.todo('when maxSupportedTransactionVersion is set');
            it.todo('when maxSupportedTransactionVersion is not set');
            it.todo('when called without additional config');
        });
    });

    describe('when `transactionDetails` is set to `none`', () => {
        describe('when called with rewards set to false', () => {
            it.todo('returns an empty array for transactions and an empty array for rewards');
            // it('returns an empty array for transactions and an empty array for rewards', async () => {
            //     expect.assertions(1);
            //     const getBlockPromise = rpc.getBlock(0n, { transactionDetails: 'none', rewards: false }).send();
            //     await expect(getBlockPromise).resolves.toMatchObject({
            //         blockhash: expect.any(String),
            //         blockHeight: expect.any(BigInt),
            //         blockTime: expect.any(Number),
            //         parentSlot: expect.any(BigInt),
            //         previousBlockhash: expect.any(String),
            //     });
            // });
        });

        describe('when called with rewards set to true', () => {
            it.todo('returns no transactions and an array of rewards for rewards');
            // it('returns no transactions and an array of rewards for rewards', async () => {
            //     expect.assertions(1);
            //     const getBlockPromise = rpc.getBlock(0n, { transactionDetails: 'none', rewards: true }).send();
            //     await expect(getBlockPromise).resolves.toMatchObject({
            //         blockhash: expect.any(String),
            //         blockHeight: expect.any(BigInt),
            //         blockTime: expect.any(Number),
            //         parentSlot: expect.any(BigInt),
            //         previousBlockhash: expect.any(String),
            //         rewards: expect.any(Array),
            //     });
            // });
        });
    });
});
