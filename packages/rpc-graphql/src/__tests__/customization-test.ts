import {
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
    Rpc,
} from '@solana/rpc';

import { createRpcGraphQL, resolveAccount } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

type GraphQLCompliantRpc = Rpc<
    GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi
>;

describe('schema customization', () => {
    let rpc: GraphQLCompliantRpc;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    it('query with types', async () => {
        expect.assertions(1);

        const masterEditionAddress = 'B2Srva38aD8bWpjghkU7jKFUqT1Y4KB2ejAnsJbP2ibA';

        // Define custom type definitions for the GraphQL schema.
        const customTypeDefs = /* GraphQL */ `
            # A Solana Master Edition NFT.
            type NftMasterEdition {
                address: Address
                metadata: Account
                mint: Account
            }

            # Query to retrieve a Solana Master Edition NFT.
            type Query {
                masterEdition(address: Address!): NftMasterEdition
            }
        `;

        // Define custom resolvers for the GraphQL schema.
        const customTypeResolvers = {
            // Resolver for the custom `NftMasterEdition` type.
            NftMasterEdition: {
                metadata: resolveAccount('metadata'),
                mint: resolveAccount('mint'),
            },
        };

        // Define custom queries for the GraphQL schema.
        const customQueryResolvers = {
            // Query to retrieve a Solana Master Edition NFT.
            masterEdition: () => {
                return {
                    // Arbitrary address.
                    address: masterEditionAddress,
                    // See scripts/fixtures/gpa1.json.
                    metadata: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                    // See scripts/fixtures/spl-token-mint-account.json.
                    mint: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                };
            },
        };

        // Create the RPC-GraphQL client with the custom type definitions and
        // resolvers.
        const rpcGraphQL = createRpcGraphQL(rpc, {
            queryResolvers: customQueryResolvers,
            typeDefs: customTypeDefs,
            typeResolvers: customTypeResolvers,
        });

        // Create a test query for the custom `masterEdition` query.
        const source = /* GraphQL */ `
            query ($masterEditionAddress: Address!) {
                masterEdition(address: $masterEditionAddress) {
                    address
                    metadata {
                        address
                        lamports
                    }
                    mint {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        ... on MintAccount {
                            decimals
                            supply
                        }
                    }
                }
            }
        `;

        // Execute the test query.
        const result = await rpcGraphQL.query(source, {
            masterEditionAddress,
        });

        // Assert the custom type definitions and resolvers were accepted and
        // the query was successful.
        expect(result).toMatchObject({
            data: {
                masterEdition: {
                    address: masterEditionAddress,
                    metadata: {
                        address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                        lamports: expect.any(BigInt),
                    },
                    mint: {
                        address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                        decimals: expect.any(Number),
                        lamports: expect.any(BigInt),
                        ownerProgram: {
                            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        },
                        supply: expect.any(String),
                    },
                },
            },
        });
    });
});
