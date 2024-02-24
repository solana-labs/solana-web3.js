import {
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
    Rpc,
} from '@solana/rpc';

import { createRpcGraphQL, RpcGraphQL } from '../..';
import { mockBlockFull } from '../../__tests__/__setup__';

type GraphQLCompliantRpc = Rpc<
    GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi
>;

// The `block` query takes a `BigInt` as a parameter. We need to test this
// for various input types that might occur outside of a JavaScript
// context, such as string or number.
describe('block inputs', () => {
    let mockRpcTransport: jest.Mock;
    let rpc: GraphQLCompliantRpc;
    let rpcGraphQL: RpcGraphQL;
    beforeEach(() => {
        mockRpcTransport = jest.fn();
        rpc = new Proxy<GraphQLCompliantRpc>({} as GraphQLCompliantRpc, {
            get(target, p) {
                if (!target[p as keyof GraphQLCompliantRpc]) {
                    const pendingRpcRequest = { send: mockRpcTransport };
                    target[p as keyof GraphQLCompliantRpc] = jest
                        .fn()
                        .mockReturnValue(pendingRpcRequest) as GraphQLCompliantRpc[keyof GraphQLCompliantRpc];
                }
                return target[p as keyof GraphQLCompliantRpc];
            },
        });
        rpcGraphQL = createRpcGraphQL(rpc);
    });
    // Does not accept raw bigint, ie. 511226n
    it('can accept a bigint parameter as variable', async () => {
        expect.assertions(2);
        const source = /* GraphQL */ `
            query testQuery($block: Slot!) {
                block(slot: $block) {
                    blockhash
                }
            }
        `;
        mockRpcTransport.mockResolvedValueOnce(mockBlockFull);
        const result = await rpcGraphQL.query(source, { block: 511226n });
        expect(result).not.toHaveProperty('errors');
        expect(result).toMatchObject({
            data: {
                block: {
                    blockhash: expect.any(String),
                },
            },
        });
    });
    it('can accept a number parameter', async () => {
        expect.assertions(2);
        const source = /* GraphQL */ `
            query testQuery {
                block(slot: 511226) {
                    blockhash
                }
            }
        `;
        mockRpcTransport.mockResolvedValueOnce(mockBlockFull);
        const result = await rpcGraphQL.query(source);
        expect(result).not.toHaveProperty('errors');
        expect(result).toMatchObject({
            data: {
                block: {
                    blockhash: expect.any(String),
                },
            },
        });
    });
    it('can accept a number parameter as variable', async () => {
        expect.assertions(2);
        const source = /* GraphQL */ `
            query testQuery($block: Slot!) {
                block(slot: $block) {
                    blockhash
                }
            }
        `;
        mockRpcTransport.mockResolvedValueOnce(mockBlockFull);
        const result = await rpcGraphQL.query(source, { block: 511226 });
        expect(result).not.toHaveProperty('errors');
        expect(result).toMatchObject({
            data: {
                block: {
                    blockhash: expect.any(String),
                },
            },
        });
    });
    it('can accept a string parameter', async () => {
        expect.assertions(2);
        const source = /* GraphQL */ `
            query testQuery {
                block(slot: "511226") {
                    blockhash
                }
            }
        `;
        mockRpcTransport.mockResolvedValueOnce(mockBlockFull);
        const result = await rpcGraphQL.query(source);
        expect(result).not.toHaveProperty('errors');
        expect(result).toMatchObject({
            data: {
                block: {
                    blockhash: expect.any(String),
                },
            },
        });
    });
    it('can accept a string parameter as variable', async () => {
        expect.assertions(2);
        const source = /* GraphQL */ `
            query testQuery($block: Slot!) {
                block(slot: $block) {
                    blockhash
                }
            }
        `;
        mockRpcTransport.mockResolvedValueOnce(mockBlockFull);
        const result = await rpcGraphQL.query(source, { block: '511226' });
        expect(result).not.toHaveProperty('errors');
        expect(result).toMatchObject({
            data: {
                block: {
                    blockhash: expect.any(String),
                },
            },
        });
    });
});
