import type {
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
    Rpc,
} from '@solana/rpc';

import { createRpcGraphQL, RpcGraphQL } from '../../index';

const FOREVER_PROMISE = new Promise(() => {
    /* never resolve */
});

describe('account loader', () => {
    let rpc: {
        getAccountInfo: jest.MockedFunction<Rpc<GetAccountInfoApi>['getAccountInfo']>;
        getBlock: jest.MockedFunction<Rpc<GetBlockApi>['getBlock']>;
        getMultipleAccounts: jest.MockedFunction<Rpc<GetMultipleAccountsApi>['getMultipleAccounts']>;
        getProgramAccounts: jest.MockedFunction<Rpc<GetProgramAccountsApi>['getProgramAccounts']>;
        getTransaction: jest.MockedFunction<Rpc<GetTransactionApi>['getTransaction']>;
    };
    let rpcGraphQL: RpcGraphQL;
    // Random address for testing.
    // Not actually used. Just needed for proper query parsing.
    const address = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
    beforeEach(() => {
        jest.useFakeTimers();
        rpc = {
            getAccountInfo: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getBlock: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getMultipleAccounts: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getProgramAccounts: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getTransaction: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
        };
        rpcGraphQL = createRpcGraphQL(
            rpc as unknown as Rpc<
                GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi
            >,
        );
    });
    describe('cached responses', () => {
        it('coalesces multiple requests for the same account into one', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account1: account(address: $address) {
                        lamports
                    }
                    account2: account(address: $address) {
                        lamports
                    }
                    account3: account(address: $address) {
                        lamports
                    }
                }
            `;
            rpcGraphQL.query(source, { address });
            await jest.runAllTimersAsync();
            expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
        });
        it('cache resets on new tick', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        lamports
                    }
                }
            `;
            // Call the query twice
            rpcGraphQL.query(source, { address });
            rpcGraphQL.query(source, { address });
            await jest.runAllTimersAsync();
            expect(rpc.getAccountInfo).toHaveBeenCalledTimes(2);
        });
    });
    describe('batch loading', () => {
        describe('request partitioning', () => {
            it('coalesces multiple requests for the same account but different fields into one request', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account1: account(address: $address) {
                            lamports
                        }
                        account2: account(address: $address) {
                            space
                        }
                        account3: account(address: $address) {
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' });
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                });
            });
            it('coalesces multiple requests for the same account but one with specified `confirmed` commitment into one request', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account1: account(address: $address) {
                            lamports
                        }
                        account2: account(address: $address, commitment: CONFIRMED) {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source, { address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' });
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
            });
            it('will not coalesce multiple requests for the same account but with different commitments into one request', async () => {
                expect.assertions(3);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account1: account(address: $address) {
                            lamports
                        }
                        account2: account(address: $address, commitment: CONFIRMED) {
                            lamports
                        }
                        account3: account(address: $address, commitment: FINALIZED) {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source, { address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' });
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(2);
                expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
                expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'finalized',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
            });
            it('coalesces multiple requests for multiple accounts into one `getMultipleAccounts` request', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        account1: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            lamports
                        }
                        account2: account(address: "E3gxDM5HFkRALNTiWkdi9CNnXpCyTRuHz1fijP9EZbqr") {
                            lamports
                        }
                        account3: account(address: "8mU8aurnEhNooLD7gRbY3jhtjWHsYpBEcFL1Dut3wu8M") {
                            lamports
                        }
                        account4: account(address: "BXiu8QD4YiJ9QhMhijgDrdZh6buNe1Axtz5JG71fuDBx") {
                            lamports
                        }
                        account5: account(address: "68xCDFqAHkce2tRMCTg8NMYDP9UHyMzSGsJQcHwto7aC") {
                            lamports
                        }
                        account6: account(address: "FAMce8gx9Kt6CiE1AE7at6P15myQyQFqQr9fXoZbfJSa") {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(
                    [
                        'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                        'E3gxDM5HFkRALNTiWkdi9CNnXpCyTRuHz1fijP9EZbqr',
                        '8mU8aurnEhNooLD7gRbY3jhtjWHsYpBEcFL1Dut3wu8M',
                        'BXiu8QD4YiJ9QhMhijgDrdZh6buNe1Axtz5JG71fuDBx',
                        '68xCDFqAHkce2tRMCTg8NMYDP9UHyMzSGsJQcHwto7aC',
                        'FAMce8gx9Kt6CiE1AE7at6P15myQyQFqQr9fXoZbfJSa',
                    ],
                    {
                        commitment: 'confirmed',
                        encoding: 'base64', // GraphQL client prefers `base64`
                    },
                );
            });
            it('coalesces multiple requests for multiple accounts into one `getMultipleAccounts` request, coalescing `confirmed` commitments', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        account1: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            lamports
                        }
                        account1Confirmed: account(
                            address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        account2: account(address: "E3gxDM5HFkRALNTiWkdi9CNnXpCyTRuHz1fijP9EZbqr") {
                            lamports
                        }
                        account2Confirmed: account(
                            address: "E3gxDM5HFkRALNTiWkdi9CNnXpCyTRuHz1fijP9EZbqr"
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        account3: account(address: "8mU8aurnEhNooLD7gRbY3jhtjWHsYpBEcFL1Dut3wu8M") {
                            lamports
                        }
                        account3Confirmed: account(
                            address: "8mU8aurnEhNooLD7gRbY3jhtjWHsYpBEcFL1Dut3wu8M"
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        account4: account(address: "BXiu8QD4YiJ9QhMhijgDrdZh6buNe1Axtz5JG71fuDBx") {
                            lamports
                        }
                        account4Confirmed: account(
                            address: "BXiu8QD4YiJ9QhMhijgDrdZh6buNe1Axtz5JG71fuDBx"
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        account5: account(address: "68xCDFqAHkce2tRMCTg8NMYDP9UHyMzSGsJQcHwto7aC") {
                            lamports
                        }
                        account5Confirmed: account(
                            address: "68xCDFqAHkce2tRMCTg8NMYDP9UHyMzSGsJQcHwto7aC"
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        account6: account(address: "FAMce8gx9Kt6CiE1AE7at6P15myQyQFqQr9fXoZbfJSa") {
                            lamports
                        }
                        account6Confirmed: account(
                            address: "FAMce8gx9Kt6CiE1AE7at6P15myQyQFqQr9fXoZbfJSa"
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(
                    [
                        'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                        'E3gxDM5HFkRALNTiWkdi9CNnXpCyTRuHz1fijP9EZbqr',
                        '8mU8aurnEhNooLD7gRbY3jhtjWHsYpBEcFL1Dut3wu8M',
                        'BXiu8QD4YiJ9QhMhijgDrdZh6buNe1Axtz5JG71fuDBx',
                        '68xCDFqAHkce2tRMCTg8NMYDP9UHyMzSGsJQcHwto7aC',
                        'FAMce8gx9Kt6CiE1AE7at6P15myQyQFqQr9fXoZbfJSa',
                    ],
                    {
                        commitment: 'confirmed',
                        encoding: 'base64', // GraphQL client prefers `base64`
                    },
                );
            });
            it('will not coalesce multiple requests for multiple accounts into one `getMultipleAccounts` request when different commitments are requested', async () => {
                expect.assertions(3);
                const source = /* GraphQL */ `
                    query testQuery {
                        account1: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            lamports
                        }
                        account1Confirmed: account(
                            address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        account1Finalized: account(
                            address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
                            commitment: FINALIZED
                        ) {
                            lamports
                        }
                        account2: account(address: "E3gxDM5HFkRALNTiWkdi9CNnXpCyTRuHz1fijP9EZbqr") {
                            lamports
                        }
                        account2Confirmed: account(
                            address: "E3gxDM5HFkRALNTiWkdi9CNnXpCyTRuHz1fijP9EZbqr"
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        account2Finalized: account(
                            address: "E3gxDM5HFkRALNTiWkdi9CNnXpCyTRuHz1fijP9EZbqr"
                            commitment: FINALIZED
                        ) {
                            lamports
                        }
                        account3: account(address: "8mU8aurnEhNooLD7gRbY3jhtjWHsYpBEcFL1Dut3wu8M") {
                            lamports
                        }
                        account3Confirmed: account(
                            address: "8mU8aurnEhNooLD7gRbY3jhtjWHsYpBEcFL1Dut3wu8M"
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        account3Finalized: account(
                            address: "8mU8aurnEhNooLD7gRbY3jhtjWHsYpBEcFL1Dut3wu8M"
                            commitment: FINALIZED
                        ) {
                            lamports
                        }
                        account4: account(address: "BXiu8QD4YiJ9QhMhijgDrdZh6buNe1Axtz5JG71fuDBx") {
                            lamports
                        }
                        account4Confirmed: account(
                            address: "BXiu8QD4YiJ9QhMhijgDrdZh6buNe1Axtz5JG71fuDBx"
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        account4Finalized: account(
                            address: "BXiu8QD4YiJ9QhMhijgDrdZh6buNe1Axtz5JG71fuDBx"
                            commitment: FINALIZED
                        ) {
                            lamports
                        }
                        account5: account(address: "68xCDFqAHkce2tRMCTg8NMYDP9UHyMzSGsJQcHwto7aC") {
                            lamports
                        }
                        account5Confirmed: account(
                            address: "68xCDFqAHkce2tRMCTg8NMYDP9UHyMzSGsJQcHwto7aC"
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        account5Finalized: account(
                            address: "68xCDFqAHkce2tRMCTg8NMYDP9UHyMzSGsJQcHwto7aC"
                            commitment: FINALIZED
                        ) {
                            lamports
                        }
                        account6: account(address: "FAMce8gx9Kt6CiE1AE7at6P15myQyQFqQr9fXoZbfJSa") {
                            lamports
                        }
                        account6Confirmed: account(
                            address: "FAMce8gx9Kt6CiE1AE7at6P15myQyQFqQr9fXoZbfJSa"
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        account6Finalized: account(
                            address: "FAMce8gx9Kt6CiE1AE7at6P15myQyQFqQr9fXoZbfJSa"
                            commitment: FINALIZED
                        ) {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                    [
                        'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                        'E3gxDM5HFkRALNTiWkdi9CNnXpCyTRuHz1fijP9EZbqr',
                        '8mU8aurnEhNooLD7gRbY3jhtjWHsYpBEcFL1Dut3wu8M',
                        'BXiu8QD4YiJ9QhMhijgDrdZh6buNe1Axtz5JG71fuDBx',
                        '68xCDFqAHkce2tRMCTg8NMYDP9UHyMzSGsJQcHwto7aC',
                        'FAMce8gx9Kt6CiE1AE7at6P15myQyQFqQr9fXoZbfJSa',
                    ],
                    {
                        commitment: 'confirmed',
                        encoding: 'base64', // GraphQL client prefers `base64`
                    },
                );
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                    [
                        'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                        'E3gxDM5HFkRALNTiWkdi9CNnXpCyTRuHz1fijP9EZbqr',
                        '8mU8aurnEhNooLD7gRbY3jhtjWHsYpBEcFL1Dut3wu8M',
                        'BXiu8QD4YiJ9QhMhijgDrdZh6buNe1Axtz5JG71fuDBx',
                        '68xCDFqAHkce2tRMCTg8NMYDP9UHyMzSGsJQcHwto7aC',
                        'FAMce8gx9Kt6CiE1AE7at6P15myQyQFqQr9fXoZbfJSa',
                    ],
                    {
                        commitment: 'finalized',
                        encoding: 'base64', // GraphQL client prefers `base64`
                    },
                );
            });
            it('coalesces multi-layered multiple requests into `getMultipleAccounts` requests', async () => {
                expect.assertions(7);

                // Set up mocks
                type MockDataOwner = { data: [string, string]; owner: string };
                const getAccountInfoMockResponseValue = ({ data, owner }: MockDataOwner) =>
                    ({
                        data,
                        owner,
                    }) as unknown as ReturnType<GetAccountInfoApi['getAccountInfo']>;
                const getMultipleAccountsMockResponse = (accounts: MockDataOwner[]) =>
                    ({
                        context: {
                            slot: 0n,
                        },
                        value: accounts.map(({ data, owner }) => getAccountInfoMockResponseValue({ data, owner })),
                    }) as unknown as ReturnType<GetMultipleAccountsApi['getMultipleAccounts']>;

                // First we should see `getMultipleAccounts` used for the first two layers
                rpc.getMultipleAccounts
                    .mockImplementationOnce(() => ({
                        send: () =>
                            Promise.resolve(
                                getMultipleAccountsMockResponse([
                                    {
                                        data: ['AA', 'base64'],
                                        owner: '11111111111111111111111111111111',
                                    },
                                    {
                                        data: ['AA', 'base64'],
                                        owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    },
                                    {
                                        data: ['AA', 'base64'],
                                        owner: 'Stake11111111111111111111111111111111111111',
                                    },
                                    {
                                        data: ['AA', 'base64'],
                                        owner: 'Vote111111111111111111111111111111111111111',
                                    },
                                ]),
                            ),
                    }))
                    .mockImplementationOnce(() => ({
                        send: () =>
                            Promise.resolve(
                                getMultipleAccountsMockResponse([
                                    {
                                        data: ['AA', 'base64'],
                                        owner: 'NativeLoader1111111111111111111111111111111',
                                    },
                                    {
                                        data: ['AA', 'base64'],
                                        owner: 'BPFLoader2111111111111111111111111111111111',
                                    },
                                    {
                                        data: ['AA', 'base64'],
                                        owner: 'NativeLoader1111111111111111111111111111111',
                                    },
                                ]),
                            ),
                    }));

                // Then we should see `getAccountInfo` used for the single
                // account in the last layer
                rpc.getAccountInfo.mockReturnValue({
                    send: jest.fn().mockResolvedValueOnce({
                        context: {
                            slot: 0,
                        },
                        value: getAccountInfoMockResponseValue({
                            data: ['AA', 'base64'],
                            owner: 'NativeLoader1111111111111111111111111111111',
                        }),
                    }),
                });

                const source = /* GraphQL */ `
                    query testQuery {
                        # Nonce account (see scripts/fixtures/nonce-account.json)
                        account1: account(address: "AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU") {
                            lamports
                            ownerProgram {
                                lamports
                            }
                        }
                        # Mint account (see scripts/fixtures/spl-token-mint-account.json)
                        account2: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            lamports
                            ownerProgram {
                                lamports
                                ownerProgram {
                                    lamports
                                }
                            }
                        }
                        # Stake account (see scripts/fixtures/stake-account.json)
                        account3: account(address: "CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN") {
                            lamports
                        }
                        # Vote account (see scripts/fixtures/vote-account.json)
                        account4: account(address: "4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp") {
                            lamports
                            ownerProgram {
                                space
                            }
                        }
                    }
                `;

                rpcGraphQL.query(source);

                // Evaluate layer 1
                await jest.advanceTimersToNextTimerAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(
                    [
                        'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU',
                        'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                        'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN',
                        '4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp',
                    ],
                    {
                        commitment: 'confirmed',
                        encoding: 'base64', // GraphQL client prefers `base64`
                    },
                );
                rpc.getMultipleAccounts.mockClear();

                // Evaluate layer 2
                await jest.advanceTimersToNextTimerAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(
                    [
                        '11111111111111111111111111111111',
                        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        'Vote111111111111111111111111111111111111111',
                    ],
                    {
                        commitment: 'confirmed',
                        encoding: 'base64', // GraphQL client prefers `base64`
                    },
                );
                rpc.getMultipleAccounts.mockClear();

                // Evaluate layer 3
                await jest.advanceTimersToNextTimerAsync();
                jest.runAllTimers();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(0);
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('BPFLoader2111111111111111111111111111111111', {
                    commitment: 'confirmed',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
            });
            it('breaks multiple account requests into multiple `getMultipleAccounts` requests if the batch limit is exceeded', async () => {
                expect.assertions(3);

                rpcGraphQL = createRpcGraphQL(
                    rpc as unknown as Rpc<
                        GetAccountInfoApi &
                            GetBlockApi &
                            GetMultipleAccountsApi &
                            GetProgramAccountsApi &
                            GetTransactionApi
                    >,
                    { maxMultipleAccountsBatchSize: 3 },
                );

                const source = /* GraphQL */ `
                    query testQuery {
                        # Nonce account (see scripts/fixtures/nonce-account.json)
                        account1: account(address: "AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU") {
                            lamports
                        }
                        # Mint account (see scripts/fixtures/spl-token-mint-account.json)
                        account2: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            lamports
                        }
                        # Stake account (see scripts/fixtures/stake-account.json)
                        account3: account(address: "CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN") {
                            lamports
                        }
                        # Vote account (see scripts/fixtures/vote-account.json)
                        account4: account(address: "4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp") {
                            lamports
                        }
                    }
                `;

                rpcGraphQL.query(source);

                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                    [
                        'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU',
                        'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                        'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN',
                    ],
                    {
                        commitment: 'confirmed',
                        encoding: 'base64', // GraphQL client prefers `base64`
                    },
                );
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(['4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp'], {
                    commitment: 'confirmed',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
            });
        });
        describe('encoding requests', () => {
            it('does not use `jsonParsed` if no parsed type is queried', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'base64',
                });
            });
            it('uses only `base58` if one data field is requested with `base58` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            data(encoding: BASE_58)
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'base58',
                });
            });
            it('uses only `base64` if one data field is requested with `base64` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            data(encoding: BASE_64)
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'base64',
                });
            });
            it('uses only `base64+zstd` if one data field is requested with `base64+zstd` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            data(encoding: BASE_64_ZSTD)
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'base64+zstd',
                });
            });
            it('only uses `jsonParsed` if a parsed type is queried, but data is not', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                });
            });
            it('does not call the loader twice for other base fields and `base58` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            data(encoding: BASE_58)
                            lamports
                            space
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'base58',
                });
            });
            it('does not call the loader twice for other base fields and `base64` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            data(encoding: BASE_64)
                            lamports
                            space
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'base64',
                });
            });
            it('does not call the loader twice for other base fields and `base64+zstd` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            data(encoding: BASE_64_ZSTD)
                            lamports
                            space
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'base64+zstd',
                });
            });
            it('does not call the loader twice for other base fields and inline fragment', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            lamports
                            space
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                });
            });
            it('will not make multiple calls for more than one inline fragment', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            ... on MintAccount {
                                supply
                            }
                            ... on TokenAccount {
                                lamports
                            }
                            ... on NonceAccount {
                                blockhash
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                });
            });
            it('uses `jsonParsed` and the requested data encoding if a parsed type is queried alongside encoded data', async () => {
                expect.assertions(3);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            data(encoding: BASE_64)
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(2);
                expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'base64',
                });
                expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                });
            });
            it('uses only the number of requests for the number of different encodings requested', async () => {
                expect.assertions(4);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                            dataBase58_1: data(encoding: BASE_58)
                            dataBase58_2: data(encoding: BASE_58)
                            dataBase58_3: data(encoding: BASE_58)
                            dataBase64_1: data(encoding: BASE_64)
                            dataBase64_2: data(encoding: BASE_64)
                            dataBase64_3: data(encoding: BASE_64)
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(3);
                expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'base58',
                });
                expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'base64',
                });
                expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                });
            });
        });
        describe('data slice requests', () => {
            describe('single account queries', () => {
                it('does not call the loader twice for data slice and other fields', async () => {
                    expect.assertions(2);
                    const source = /* GraphQL */ `
                        query testQuery {
                            account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                                lamports
                                space
                            }
                        }
                    `;
                    rpcGraphQL.query(source);
                    await jest.runAllTimersAsync();
                    expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                    expect(rpc.getAccountInfo).toHaveBeenLastCalledWith(
                        'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 10, offset: 0 },
                            encoding: 'base64',
                        },
                    );
                });
                it('coalesces a data with no data slice and data with data slice within byte limit to the same request', async () => {
                    expect.assertions(2);
                    const source = /* GraphQL */ `
                        query testQuery {
                            account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                dataWithNoSlice: data(encoding: BASE_64)
                                dataWithSlice: data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source);
                    await jest.runAllTimersAsync();
                    expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                    expect(rpc.getAccountInfo).toHaveBeenLastCalledWith(
                        'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                        {
                            commitment: 'confirmed',
                            encoding: 'base64', // No `dataSlice` arg since one field asked for the whole data
                        },
                    );
                });
                it('coalesces non-sliced and sliced data requests across encodings', async () => {
                    expect.assertions(3);
                    const source = /* GraphQL */ `
                        query testQuery {
                            account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                dataBase58WithNoSlice: data(encoding: BASE_58)
                                dataBase58WithSlice: data(encoding: BASE_58, dataSlice: { length: 10, offset: 0 })
                                dataBase64WithNoSlice: data(encoding: BASE_64)
                                dataBase64WithSlice: data(encoding: BASE_64, dataSlice: { length: 20, offset: 4 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source);
                    await jest.runAllTimersAsync();
                    expect(rpc.getAccountInfo).toHaveBeenCalledTimes(2);
                    expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                        commitment: 'confirmed',
                        encoding: 'base58', // No `dataSlice` arg since one field asked for the whole data
                    });
                    expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                        commitment: 'confirmed',
                        encoding: 'base64', // No `dataSlice` arg since one field asked for the whole data
                    });
                });
                it('always uses separate requests for `base64+zstd` no matter the data slice', async () => {
                    expect.assertions(4);
                    const source = /* GraphQL */ `
                        query testQuery {
                            account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                dataBase64ZstdWithNoSlice: data(encoding: BASE_64_ZSTD)
                                dataBase64ZstdWithSlice1: data(
                                    encoding: BASE_64_ZSTD
                                    dataSlice: { length: 16, offset: 4 }
                                )
                                dataBase64ZstdWithSlice2: data(
                                    encoding: BASE_64_ZSTD
                                    dataSlice: { length: 40, offset: 12 }
                                )
                            }
                        }
                    `;
                    rpcGraphQL.query(source);
                    await jest.runAllTimersAsync();
                    expect(rpc.getAccountInfo).toHaveBeenCalledTimes(3);
                    expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                        commitment: 'confirmed',
                        encoding: 'base64+zstd',
                    });
                    expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                        commitment: 'confirmed',
                        dataSlice: { length: 16, offset: 4 },
                        encoding: 'base64+zstd',
                    });
                    expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                        commitment: 'confirmed',
                        dataSlice: { length: 40, offset: 12 },
                        encoding: 'base64+zstd',
                    });
                });
                it('coalesces multiple data slice requests within byte limit to the same request', async () => {
                    expect.assertions(2);
                    const source = /* GraphQL */ `
                        query testQuery {
                            account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { length: 16, offset: 2 })
                                dataSlice3: data(encoding: BASE_64, dataSlice: { length: 20, offset: 6 })
                                dataSlice4: data(encoding: BASE_64, dataSlice: { length: 10, offset: 10 })
                                dataSlice5: data(encoding: BASE_64, dataSlice: { length: 10, offset: 30 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source);
                    await jest.runAllTimersAsync();
                    expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
                    expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                        commitment: 'confirmed',
                        dataSlice: { length: 40, offset: 0 }, // Coalesced into one slice
                        encoding: 'base64',
                    });
                });
                it('splits multiple data slice requests beyond byte limit into two requests', async () => {
                    expect.assertions(3);
                    const source = /* GraphQL */ `
                        query testQuery {
                            account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { length: 4, offset: 0 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { length: 4, offset: 2000 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source);
                    await jest.runAllTimersAsync();
                    expect(rpc.getAccountInfo).toHaveBeenCalledTimes(2);
                    expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 0 },
                        encoding: 'base64',
                    });
                    expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 2000 },
                        encoding: 'base64',
                    });
                });
                it('honors the byte limit across encodings', async () => {
                    expect.assertions(5);
                    const source = /* GraphQL */ `
                        query testQuery {
                            account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { length: 4, offset: 0 })
                                dataBase58BeyondByteLimit: data(
                                    encoding: BASE_58
                                    dataSlice: { length: 4, offset: 2000 }
                                )
                                dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { length: 4, offset: 0 })
                                dataBase64BeyondByteLimit: data(
                                    encoding: BASE_64
                                    dataSlice: { length: 4, offset: 2000 }
                                )
                            }
                        }
                    `;
                    rpcGraphQL.query(source);
                    await jest.runAllTimersAsync();
                    expect(rpc.getAccountInfo).toHaveBeenCalledTimes(4);
                    expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 0 },
                        encoding: 'base58',
                    });
                    expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 2000 },
                        encoding: 'base58',
                    });
                    expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 0 },
                        encoding: 'base64',
                    });
                    expect(rpc.getAccountInfo).toHaveBeenCalledWith('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 2000 },
                        encoding: 'base64',
                    });
                });
            });
            describe('multiple account queries', () => {
                it('does not call the loader twice for data slice and other fields', async () => {
                    expect.assertions(2);
                    const source = /* GraphQL */ `
                        query testQuery {
                            accountA: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                                lamports
                                space
                            }
                            accountB: account(address: "2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb") {
                                data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                                lamports
                                space
                            }
                            accountC: account(address: "4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u") {
                                data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                                lamports
                                space
                            }
                        }
                    `;
                    rpcGraphQL.query(source);
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                    expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 10, offset: 0 },
                            encoding: 'base64',
                        },
                    );
                });
                it('coalesces a data with no data slice and data with data slice within byte limit to the same request', async () => {
                    expect.assertions(2);
                    const source = /* GraphQL */ `
                        query testQuery {
                            accountA: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                dataWithNoSlice: data(encoding: BASE_64)
                                dataWithSlice: data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                            }
                            accountB: account(address: "2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb") {
                                dataWithNoSlice: data(encoding: BASE_64)
                                dataWithSlice: data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                            }
                            accountC: account(address: "4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u") {
                                dataWithNoSlice: data(encoding: BASE_64)
                                dataWithSlice: data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source);
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                    expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            encoding: 'base64', // No `dataSlice` arg since one field asked for the whole data
                        },
                    );
                });
                it('coalesces non-sliced and sliced data requests across encodings', async () => {
                    expect.assertions(3);
                    const source = /* GraphQL */ `
                        query testQuery {
                            accountA: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                dataBase58WithNoSlice: data(encoding: BASE_58)
                                dataBase58WithSlice: data(encoding: BASE_58, dataSlice: { length: 10, offset: 0 })
                                dataBase64WithNoSlice: data(encoding: BASE_64)
                                dataBase64WithSlice: data(encoding: BASE_64, dataSlice: { length: 12, offset: 4 })
                            }
                            accountB: account(address: "2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb") {
                                dataBase58WithNoSlice: data(encoding: BASE_58)
                                dataBase58WithSlice: data(encoding: BASE_58, dataSlice: { length: 14, offset: 4 })
                                dataBase64WithNoSlice: data(encoding: BASE_64)
                                dataBase64WithSlice: data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                            }
                            accountC: account(address: "4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u") {
                                dataBase58WithNoSlice: data(encoding: BASE_58)
                                dataBase58WithSlice: data(encoding: BASE_58, dataSlice: { length: 10, offset: 50 })
                                dataBase64WithNoSlice: data(encoding: BASE_64)
                                dataBase64WithSlice: data(encoding: BASE_64, dataSlice: { length: 100, offset: 0 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source);
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            encoding: 'base58', // No `dataSlice` arg since one field asked for the whole data
                        },
                    );
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            encoding: 'base64', // No `dataSlice` arg since one field asked for the whole data
                        },
                    );
                });
                it('coalesces multiple data slice requests within byte limit to the same request', async () => {
                    expect.assertions(2);
                    const source = /* GraphQL */ `
                        query testQuery {
                            accountA: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 10 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { offset: 2, length: 16 })
                                dataSlice3: data(encoding: BASE_64, dataSlice: { offset: 6, length: 20 })
                                dataSlice4: data(encoding: BASE_64, dataSlice: { offset: 10, length: 10 })
                                dataSlice5: data(encoding: BASE_64, dataSlice: { offset: 30, length: 10 })
                            }
                            accountB: account(address: "2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb") {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 10 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { offset: 2, length: 16 })
                                dataSlice3: data(encoding: BASE_64, dataSlice: { offset: 6, length: 20 })
                                dataSlice4: data(encoding: BASE_64, dataSlice: { offset: 10, length: 10 })
                                dataSlice5: data(encoding: BASE_64, dataSlice: { offset: 30, length: 10 })
                            }
                            accountC: account(address: "4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u") {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 10 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { offset: 2, length: 16 })
                                dataSlice3: data(encoding: BASE_64, dataSlice: { offset: 6, length: 20 })
                                dataSlice4: data(encoding: BASE_64, dataSlice: { offset: 10, length: 10 })
                                dataSlice5: data(encoding: BASE_64, dataSlice: { offset: 30, length: 10 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source);
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 40, offset: 0 }, // Coalesced into one slice
                            encoding: 'base64',
                        },
                    );
                });
                it('splits multiple data slice requests beyond the default byte limit into two requests', async () => {
                    expect.assertions(3);
                    const source = /* GraphQL */ `
                        query testQuery {
                            accountA: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { offset: 2000, length: 4 })
                            }
                            accountB: account(address: "2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb") {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { offset: 2000, length: 4 })
                            }
                            accountC: account(address: "4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u") {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { offset: 2000, length: 4 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source);
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 4, offset: 0 },
                            encoding: 'base64',
                        },
                    );
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 4, offset: 2000 },
                            encoding: 'base64',
                        },
                    );
                });
                it('splits multiple data slice requests beyond a provided byte limit into two requests', async () => {
                    expect.assertions(3);
                    const maxDataSliceByteRange = 100;
                    rpcGraphQL = createRpcGraphQL(
                        rpc as unknown as Rpc<
                            GetAccountInfoApi &
                                GetBlockApi &
                                GetMultipleAccountsApi &
                                GetProgramAccountsApi &
                                GetTransactionApi
                        >,
                        {
                            maxDataSliceByteRange,
                        },
                    );
                    const source = /* GraphQL */ `
                        query testQuery($maxDataSliceByteRange: Int!) {
                            accountA: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataSlice2: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                            }
                            accountB: account(address: "2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb") {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataSlice2: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                            }
                            accountC: account(address: "4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u") {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataSlice2: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { maxDataSliceByteRange });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 4, offset: 0 },
                            encoding: 'base64',
                        },
                    );
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 4, offset: maxDataSliceByteRange },
                            encoding: 'base64',
                        },
                    );
                });
                it('honors the default byte limit across encodings', async () => {
                    expect.assertions(5);
                    const source = /* GraphQL */ `
                        query testQuery {
                            accountA: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { offset: 0, length: 4 })
                                dataBase58BeyondByteLimit: data(
                                    encoding: BASE_58
                                    dataSlice: { offset: 2000, length: 4 }
                                )
                                dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataBase64BeyondByteLimit: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: 2000, length: 4 }
                                )
                            }
                            accountB: account(address: "2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb") {
                                dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { offset: 0, length: 4 })
                                dataBase58BeyondByteLimit: data(
                                    encoding: BASE_58
                                    dataSlice: { offset: 2000, length: 4 }
                                )
                                dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataBase64BeyondByteLimit: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: 2000, length: 4 }
                                )
                            }
                            accountC: account(address: "4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u") {
                                dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { offset: 0, length: 4 })
                                dataBase58BeyondByteLimit: data(
                                    encoding: BASE_58
                                    dataSlice: { offset: 2000, length: 4 }
                                )
                                dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataBase64BeyondByteLimit: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: 2000, length: 4 }
                                )
                            }
                        }
                    `;
                    rpcGraphQL.query(source);
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(4);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 4, offset: 0 },
                            encoding: 'base58',
                        },
                    );
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 4, offset: 2000 },
                            encoding: 'base58',
                        },
                    );
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 4, offset: 0 },
                            encoding: 'base64',
                        },
                    );
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 4, offset: 2000 },
                            encoding: 'base64',
                        },
                    );
                });
                it('honors a provided byte limit across encodings', async () => {
                    expect.assertions(5);
                    const maxDataSliceByteRange = 100;
                    rpcGraphQL = createRpcGraphQL(
                        rpc as unknown as Rpc<
                            GetAccountInfoApi &
                                GetBlockApi &
                                GetMultipleAccountsApi &
                                GetProgramAccountsApi &
                                GetTransactionApi
                        >,
                        {
                            maxDataSliceByteRange,
                        },
                    );
                    const source = /* GraphQL */ `
                        query testQuery($maxDataSliceByteRange: Int!) {
                            accountA: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                                dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { offset: 0, length: 4 })
                                dataBase58BeyondByteLimit: data(
                                    encoding: BASE_58
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                                dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataBase64BeyondByteLimit: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                            }
                            accountB: account(address: "2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb") {
                                dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { offset: 0, length: 4 })
                                dataBase58BeyondByteLimit: data(
                                    encoding: BASE_58
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                                dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataBase64BeyondByteLimit: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                            }
                            accountC: account(address: "4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u") {
                                dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { offset: 0, length: 4 })
                                dataBase58BeyondByteLimit: data(
                                    encoding: BASE_58
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                                dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataBase64BeyondByteLimit: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { maxDataSliceByteRange });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(4);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 4, offset: 0 },
                            encoding: 'base58',
                        },
                    );
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 4, offset: maxDataSliceByteRange },
                            encoding: 'base58',
                        },
                    );
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 4, offset: 0 },
                            encoding: 'base64',
                        },
                    );
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(
                        [
                            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            '2KAARoNUYTddAChEdWb21bdKH6dWu51AAPFjSjRmzsbb',
                            '4rFV8bvFpacLkvxTFuVN4pqe5s7CTyEkmYvPpu45779u',
                        ],
                        {
                            commitment: 'confirmed',
                            dataSlice: { length: 4, offset: maxDataSliceByteRange },
                            encoding: 'base64',
                        },
                    );
                });
            });
        });
    });
});
