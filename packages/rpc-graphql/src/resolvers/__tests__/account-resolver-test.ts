import { Address } from '@solana/addresses';

import { createRpcGraphQL, RpcGraphQL } from '../../index';

describe('account resolver', () => {
    let getAccountInfoMock: jest.Mock;
    let rpcGraphQL: RpcGraphQL;
    beforeEach(() => {
        jest.useFakeTimers();
        getAccountInfoMock = jest.fn().mockImplementation((address: Address) => {
            const owner =
                address === 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca'
                    ? 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
                    : 'BPFLoader2111111111111111111111111111111111';
            return Promise.resolve({
                context: {
                    slot: 0,
                },
                value: {
                    data: ['AA', 'base64'],
                    owner,
                },
            });
        });
        const rpc = {
            getAccountInfo: (address: Address) => ({
                send: () => getAccountInfoMock(address),
            }),
        } as unknown as Parameters<typeof createRpcGraphQL>[0];
        rpcGraphQL = createRpcGraphQL(rpc);
    });
    describe('address-only requests', () => {
        describe('in the first level', () => {
            it('will not call the RPC for only an address', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                            address
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                jest.runAllTicks();
                expect(getAccountInfoMock).not.toHaveBeenCalled();
            });
        });
        describe('in the second level', () => {
            it('will not call the RPC for only an address', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                            address
                            ownerProgram {
                                address
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                jest.runAllTicks();
                expect(getAccountInfoMock).toHaveBeenCalledTimes(1);
            });
        });
        describe('in the third level', () => {
            it('will not call the RPC for only an address', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                            address
                            ownerProgram {
                                address
                                ownerProgram {
                                    address
                                }
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.advanceTimersToNextTimerAsync();
                await jest.advanceTimersToNextTimerAsync();
                expect(getAccountInfoMock).toHaveBeenCalledTimes(2);
            });
        });
    });
});
