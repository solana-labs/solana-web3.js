/* eslint-disable sort-keys-fix/sort-keys-fix */
import { createSolanaRpcApi, SolanaRpcMethods } from '@solana/rpc-core';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { createRpcGraphQL, RpcGraphQL } from '../rpc';

describe('block', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    let rpcGraphQL: RpcGraphQL;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
        rpcGraphQL = createRpcGraphQL(rpc);
    });

    // TODO: These are not always going to work (can't guarantee slot 0 exists)
    describe('basic queries', () => {
        const variableValues = {
            slot: 0n,
            commitment: 'confirmed',
        };
        it("can query a block's blockhash", async () => {
            expect.assertions(1);
            const source = `
                query testQuery($slot: BigInt!, $commitment: Commitment) {
                    block(slot: $slot, commitment: $commitment) {
                        blockhash
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    block: {
                        blockhash: expect.any(String),
                    },
                },
            });
        });
        it("can query a block's block time", async () => {
            expect.assertions(1);
            const source = `
                query testQuery($slot: BigInt!, $commitment: Commitment) {
                    block(slot: $slot, commitment: $commitment) {
                        blockTime
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    block: {
                        blockTime: expect.any(BigInt),
                    },
                },
            });
        });
    });
    describe('block with signatures transaction details', () => {
        it.todo('can query a block with signatures');
        it.todo('can query a block with signatures and rewards');
    });
    it.todo('block with accounts transaction details');
    describe('block with full transaction details', () => {
        it.todo('can query a block with base58 encoded transactions');
        it.todo('can query a block with base64 encoded transactions');
        it.todo('can query a block with transactions as JSON');
        it.todo('can query a block with transactions as JSON parsed');
        it.todo('can query a block with transactions as JSON parsed with specific instructions');
    });
});
