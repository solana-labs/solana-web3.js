import { getStructCodec } from '@solana/codecs-data-structures';
import { getU32Codec } from '@solana/codecs-numbers';
import { getBase64Codec, getStringCodec } from '@solana/codecs-strings';
import { createSolanaRpcApi, SolanaRpcMethods } from '@solana/rpc-core';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { Base64EncodedWireTransaction } from '@solana/transactions';
import fetchMock from 'jest-fetch-mock-fork';

import { createRpcGraphQL, RpcGraphQL } from '../rpc';
import { getCryptoKeyPairWithAirdrop, getMockTransactionMemo, getMockTransactionReturnData } from './__setup__';

describe('simulate', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    let rpcGraphQL: RpcGraphQL;

    const memo = 'Hello from Solana RPC GraphQL!';
    let feePayer: CryptoKeyPair;
    let base64MemoTransaction: Base64EncodedWireTransaction;
    let base64ReturnDataTransaction: Base64EncodedWireTransaction;

    beforeAll(async () => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
        feePayer = await getCryptoKeyPairWithAirdrop(rpc);
        base64MemoTransaction = await getMockTransactionMemo(rpc, feePayer, memo);
        base64ReturnDataTransaction = await getMockTransactionReturnData(rpc, feePayer);
    });

    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
        rpcGraphQL = createRpcGraphQL(rpc);
    });

    describe('basic simulation', () => {
        it('should simulate a transaction', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testSimulate($transaction: String!) {
                    simulate(transaction: $transaction) {
                        err
                        logs
                        returnData {
                            data
                            programId
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, {
                transaction: base64MemoTransaction,
            });
            expect(result).toMatchObject({
                data: {
                    simulate: {
                        err: null,
                        logs: expect.any(Array),
                        returnData: null,
                    },
                },
            });
        });
        it('should return valid return data', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testSimulate($transaction: String!) {
                    simulate(transaction: $transaction) {
                        err
                        logs
                        returnData {
                            data
                            programId
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, {
                transaction: base64ReturnDataTransaction,
            });
            expect(result).toMatchObject({
                data: {
                    simulate: {
                        err: null,
                        logs: expect.any(Array),
                        returnData: {
                            data: 'AwAAAFBOR2QAAAA=',
                            programId: '7aF53SYcGeBw2FsUKiCqWR5m1ABZ9qsTXxLoD5NRqaS8',
                        },
                    },
                },
            });
            // Decode the return data
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const data = result.data.simulate.returnData.data as string;
            const bytes = getBase64Codec().encode(data);
            const assetCodec = getStructCodec([
                ['assetType', getStringCodec()],
                ['assetSize', getU32Codec()],
            ]);
            expect(assetCodec.decode(bytes)[0]).toStrictEqual({
                assetSize: 100,
                assetType: 'PNG',
            });
        });
    });
});
