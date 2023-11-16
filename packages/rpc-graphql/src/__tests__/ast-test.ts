import { Signature } from '@solana/keys';
import { createSolanaRpcApi, SolanaRpcMethods } from '@solana/rpc-core';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { Base64EncodedWireTransaction } from '@solana/transactions';
import fetchMock from 'jest-fetch-mock-fork';

import { createRpcGraphQL, RpcGraphQL } from '../rpc';
import {
    getCryptoKeyPairWithAirdrop,
    getMockTransactionReturnData,
    mockRpcResponse,
    mockTransactionCreateBet,
} from './__setup__';

const programAst = [
    /* JSON */ `
{
    "instructions": [
        {
            "name": "CreateBet",
            "type": {
                "fields": [
                    {
                        "name": "amount",
                        "type": "u64",
                    },
                    {
                        "name": "letItRide",
                        "type": "boolean",
                    },
                    {
                        "name": "riskAppetite",
                        "type": "u8",
                    },
                    {
                        "name": "team",
                        "type": "string",
                    },
                    {
                        "name": "username",
                        "type": "string",
                    },
                ],
                "kind": "struct",
            },
        }
    ],
    "accounts": [
        {
            "name": "TokenMetadata",
            "type": {
                "fields": [
                    {
                        "name": "title",
                        "type": "string",
                    },
                    {
                        "name": "symbol",
                        "type": "string",
                    },
                    {
                        "name": "uri",
                        "type": "string",
                    },
                    {
                        "name": "mint",
                        "type": "publicKey",
                    },
                    {
                        "name": "mintAuthority",
                        "type": "publicKey",
                    },
                ],
                "kind": "struct",
            },
        }
    ],
    "types": [
        {
            "name": "Asset",
            "type": {
                "fields": [
                    {
                        "name": "assetSize",
                        "type": "u32",
                    },
                    {
                        "name": "assetType",
                        "type": "string",
                    },
                ],
                "kind": "struct",
            },
        }
    ],
}
`,
];

describe('codecs', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    let rpcGraphQL: RpcGraphQL;

    // Random signature for testing.
    // Not actually used. Just needed for proper query parsing.
    const defaultTransactionSignature =
        '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk' as Signature;
    let feePayer: CryptoKeyPair;
    let base64ReturnDataTransaction: Base64EncodedWireTransaction;

    beforeAll(async () => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
        feePayer = await getCryptoKeyPairWithAirdrop(rpc);
        base64ReturnDataTransaction = await getMockTransactionReturnData(rpc, feePayer);
    });

    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
        rpcGraphQL = createRpcGraphQL(rpc, { programAst });
    });

    describe('accounts', () => {
        it('can get a `TokenMetadata` account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/token-metadata-account.json
            const variableValues = {
                address: 'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU',
            };
            const source = /* GraphQL */ `
                query testQuery($address: String!) {
                    account(address: $address) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        rentEpoch
                        space
                        ... on TokenMetadataAccount {
                            title
                            symbol
                            uri
                            mint {
                                address
                            }
                            mintAuthority {
                                address
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU',
                        blockhash: expect.any(String),
                        feeCalculator: {
                            lamportsPerSignature: expect.any(String),
                        },
                        lamports: expect.any(BigInt),
                        mint: {
                            address: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                        },
                        mintAuthority: {
                            address: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                        },
                        ownerProgram: {
                            address: '11111111111111111111111111111111',
                        },
                        rentEpoch: expect.any(BigInt),
                        space: 80n,
                        symbol: 'SOL',
                        title: 'Solana',
                        uri: 'https://solana.com',
                    },
                },
            });
        });
    });
    describe('instructions', () => {
        it('can get a `CreateBet` instruction', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionCreateBet)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(signature: "${defaultTransactionSignature}") {
                        ... on TransactionParsed {
                            meta {
                                innerInstructions {
                                    instructions {
                                            programId
                                        ... on CreateBetInstruction {
                                            amount
                                            letItRide
                                            riskAppetite
                                            team
                                            username
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        meta: {
                            innerInstructions: expect.arrayContaining([
                                {
                                    instructions: expect.arrayContaining([
                                        {
                                            amount: expect.any(BigInt),
                                            letItRide: false,
                                            programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                            riskAppetite: 0,
                                            team: 'Team A',
                                            username: 'Alice',
                                        },
                                    ]),
                                },
                            ]),
                        },
                    },
                },
            });
        });
    });
    describe('return data', () => {
        it('can get an `Asset` return data', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testSimulate($transaction: String!) {
                    simulate(transaction: $transaction) {
                        err
                        logs
                        returnData {
                            programId
                            ... on AssetReturnData {
                                assetSize
                                assetType
                            }
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
                            assetSize: 100,
                            assetType: 'PNG',
                            programId: '7aF53SYcGeBw2FsUKiCqWR5m1ABZ9qsTXxLoD5NRqaS8',
                        },
                    },
                },
            });
        });
    });
});
