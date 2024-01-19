import { buildCallChain } from '../processor/processor';

describe('account query processing', () => {
    describe('queries without data fields or variables', () => {
        it('a single account query with no child layers', () => {
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC") {
                        lamports
                        space
                    }
                }
            `;
            const callChain = buildCallChain(source);
            expect(callChain).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [],
                        },
                    ],
                },
            ]);
        });
        it('a single account query with one child layer', () => {
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC") {
                        lamports
                        owner {
                            lamports
                        }
                    }
                }
            `;
            const callChain = buildCallChain(source);
            expect(callChain).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [],
                        },
                    ],
                },
            ]);
        });
        it('a single account query with multiple child layers', () => {
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC") {
                        lamports
                        owner {
                            lamports
                            owner {
                                lamports
                                owner {
                                    lamports
                                }
                            }
                        }
                    }
                }
            `;
            const callChain = buildCallChain(source);
            expect(callChain).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [],
                        },
                    ],
                },
            ]);
        });
        it('mutiple account queries with multiple child layers', () => {
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC") {
                        lamports
                        owner {
                            lamports
                            owner {
                                lamports
                            }
                        }
                    }
                    account(address: "DQaGNVhPNcGuvkUHcbLSPoJfNiRo1aXkbs45fCxmDQ4") {
                        lamports
                        owner {
                            lamports
                        }
                    }
                    account(address: "2wMTsqYq1RW4tjiqgB5xyPtaU12WohVAbmp4FtPX7Jj5") {
                        lamports
                        owner {
                            lamports
                            owner {
                                lamports
                                owner {
                                    lamports
                                }
                            }
                        }
                    }
                }
            `;
            const callChain = buildCallChain(source);
            expect(callChain).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [],
                        },
                        {
                            address: 'DQaGNVhPNcGuvkUHcbLSPoJfNiRo1aXkbs45fCxmDQ4',
                            argSets: [],
                        },
                        {
                            address: '2wMTsqYq1RW4tjiqgB5xyPtaU12WohVAbmp4FtPX7Jj5',
                            argSets: [],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [],
                        },
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 1,
                            },
                            argSets: [],
                        },
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 2,
                            },
                            argSets: [],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [],
                        },
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 2,
                            },
                            argSets: [],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 1,
                            },
                            argSets: [],
                        },
                    ],
                },
            ]);
        });
    });
    describe('queries with data fields but without variables', () => {
        it('a single account query with no child layers', () => {
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC") {
                        dataBase58: data(encoding: BASE_58, dataSlice: { offset: 0, length: 10 })
                        dataBase64: data(encoding: BASE_64)
                        lamports
                        space
                    }
                }
            `;
            const callChain = buildCallChain(source);
            expect(callChain).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [
                                { dataSlice: { length: 10, offset: 0 }, encoding: 'base58' },
                                { encoding: 'base64' },
                            ],
                        },
                    ],
                },
            ]);
        });
        it('a single account query with one child layer', () => {
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC") {
                        data(encoding: BASE_64_ZSTD)
                        lamports
                        owner {
                            dataBase58: data(encoding: BASE_58)
                            dataBase64: data(encoding: BASE_64, dataSlice: { offset: 30, length: 9 })
                            lamports
                        }
                    }
                }
            `;
            const callChain = buildCallChain(source);
            expect(callChain).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [{ encoding: 'base64+zstd' }],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [
                                { encoding: 'base58' },
                                { dataSlice: { length: 9, offset: 30 }, encoding: 'base64' },
                            ],
                        },
                    ],
                },
            ]);
        });
        it('a single account query with multiple child layers', () => {
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC") {
                        data(encoding: BASE_64)
                        lamports
                        owner {
                            data(encoding: BASE_58)
                            lamports
                            owner {
                                dataBase58: data(encoding: BASE_58)
                                dataBase64: data(encoding: BASE_64, dataSlice: { offset: 0, length: 100 })
                                lamports
                                owner {
                                    data(encoding: BASE_64)
                                    lamports
                                }
                            }
                        }
                    }
                }
            `;
            const callChain = buildCallChain(source);
            expect(callChain).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [
                                {
                                    encoding: 'base64',
                                },
                            ],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [
                                {
                                    encoding: 'base58',
                                },
                            ],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [
                                {
                                    encoding: 'base58',
                                },
                                {
                                    dataSlice: {
                                        length: 100,
                                        offset: 0,
                                    },
                                    encoding: 'base64',
                                },
                            ],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [
                                {
                                    encoding: 'base64',
                                },
                            ],
                        },
                    ],
                },
            ]);
        });
        it('multiple account queries with multiple child layers', () => {
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC") {
                        data(encoding: BASE_64)
                        lamports
                        owner {
                            data(encoding: BASE_58)
                            lamports
                            owner {
                                dataBase58: data(encoding: BASE_58)
                                dataBase64: data(encoding: BASE_64, dataSlice: { offset: 0, length: 100 })
                                lamports
                            }
                        }
                    }
                    account(address: "3bb7N79eGhutUx42MaGz4ponxmAPg7U6NpPekmJHjrPH") {
                        data(encoding: BASE_58)
                        lamports
                        owner {
                            data(encoding: BASE_64)
                            lamports
                        }
                    }
                    account(address: "86oTHxrqUQgpCcYP87tgdZKHzHPoFqqHWkmrPMXqxkK3") {
                        data(encoding: BASE_64_ZSTD)
                        lamports
                        owner {
                            data(encoding: BASE_64_ZSTD)
                            lamports
                            owner {
                                dataBase58: data(encoding: BASE_58)
                                dataBase64: data(encoding: BASE_64, dataSlice: { offset: 5, length: 300 })
                                lamports
                                owner {
                                    data(encoding: BASE_64)
                                    lamports
                                }
                            }
                        }
                    }
                }
            `;
            const callChain = buildCallChain(source);
            expect(callChain).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [
                                {
                                    encoding: 'base64',
                                },
                            ],
                        },
                        {
                            address: '3bb7N79eGhutUx42MaGz4ponxmAPg7U6NpPekmJHjrPH',
                            argSets: [
                                {
                                    encoding: 'base58',
                                },
                            ],
                        },
                        {
                            address: '86oTHxrqUQgpCcYP87tgdZKHzHPoFqqHWkmrPMXqxkK3',
                            argSets: [
                                {
                                    encoding: 'base64+zstd',
                                },
                            ],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [
                                {
                                    encoding: 'base58',
                                },
                            ],
                        },
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 1,
                            },
                            argSets: [
                                {
                                    encoding: 'base64',
                                },
                            ],
                        },
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 2,
                            },
                            argSets: [
                                {
                                    encoding: 'base64+zstd',
                                },
                            ],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [
                                {
                                    encoding: 'base58',
                                },
                                {
                                    dataSlice: {
                                        length: 100,
                                        offset: 0,
                                    },
                                    encoding: 'base64',
                                },
                            ],
                        },
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 2,
                            },
                            argSets: [
                                {
                                    encoding: 'base58',
                                },
                                {
                                    dataSlice: {
                                        length: 300,
                                        offset: 5,
                                    },
                                    encoding: 'base64',
                                },
                            ],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 1,
                            },
                            argSets: [
                                {
                                    encoding: 'base64',
                                },
                            ],
                        },
                    ],
                },
            ]);
        });
    });
    describe('queries with data fields and variables', () => {
        it('a single account query with no child layers', () => {
            const source = /* GraphQL */ `
                query testQuery($address: Address!, $dataSlice: DataSliceInput) {
                    account(address: $address) {
                        dataBase58: data(encoding: BASE_58, dataSlice: $dataSlice)
                        dataBase64: data(encoding: BASE_64)
                        lamports
                        space
                    }
                }
            `;
            expect(
                // Data slice defined
                buildCallChain(source, {
                    address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                    dataSlice: { length: 4, offset: 0 },
                }),
            ).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [
                                { dataSlice: { length: 4, offset: 0 }, encoding: 'base58' },
                                { encoding: 'base64' },
                            ],
                        },
                    ],
                },
            ]);
            expect(
                // Data slice not defined
                buildCallChain(source, {
                    address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                }),
            ).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [{ encoding: 'base58' }, { encoding: 'base64' }],
                        },
                    ],
                },
            ]);
        });
        it('a single account query with one child layer', () => {
            const source = /* GraphQL */ `
                query testQuery(
                    $address: Address!
                    $firstAccountEncoding: AccountEncoding
                    $dataSlice: DataSliceInput
                ) {
                    account(address: $address) {
                        data(encoding: $firstAccountEncoding)
                        lamports
                        owner {
                            dataBase58: data(encoding: BASE_58)
                            dataBase64: data(encoding: BASE_64, dataSlice: $dataSlice)
                            lamports
                        }
                    }
                }
            `;
            expect(
                // All variables defined
                buildCallChain(source, {
                    address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                    dataSlice: { length: 4, offset: 0 },
                    firstAccountEncoding: 'BASE_64_ZSTD',
                }),
            ).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [{ encoding: 'base64+zstd' }],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [
                                { encoding: 'base58' },
                                { dataSlice: { length: 4, offset: 0 }, encoding: 'base64' },
                            ],
                        },
                    ],
                },
            ]);
            expect(
                // Only required variables defined
                buildCallChain(source, {
                    address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                }),
            ).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [{ encoding: 'base58' }, { encoding: 'base64' }],
                        },
                    ],
                },
            ]);
        });
        it('a single account query with multiple child layers', () => {
            const source = /* GraphQL */ `
                query testQuery(
                    $address: Address!
                    $firstAccountEncoding: AccountEncoding
                    $secondAccountEncoding: AccountEncoding
                    $dataSlice: DataSliceInput
                ) {
                    account(address: $address) {
                        data(encoding: $firstAccountEncoding)
                        lamports
                        owner {
                            data(encoding: $secondAccountEncoding)
                            lamports
                            owner {
                                dataBase58: data(encoding: BASE_58)
                                dataBase64: data(encoding: BASE_64, dataSlice: $dataSlice)
                                lamports
                                owner {
                                    data(encoding: BASE_64)
                                    lamports
                                }
                            }
                        }
                    }
                }
            `;
            expect(
                // All variables defined
                buildCallChain(source, {
                    address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                    dataSlice: { length: 4, offset: 0 },
                    firstAccountEncoding: 'BASE_64_ZSTD',
                    secondAccountEncoding: 'BASE_64',
                }),
            ).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',

                            argSets: [{ encoding: 'base64+zstd' }],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [{ encoding: 'base64' }],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [
                                { encoding: 'base58' },
                                { dataSlice: { length: 4, offset: 0 }, encoding: 'base64' },
                            ],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [{ encoding: 'base64' }],
                        },
                    ],
                },
            ]);
            expect(
                // Only required variables defined
                buildCallChain(source, {
                    address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                }),
            ).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',

                            argSets: [],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [{ encoding: 'base58' }, { encoding: 'base64' }],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [{ encoding: 'base64' }],
                        },
                    ],
                },
            ]);
        });
    });
    describe('queries with data fields and variables and inline fragments', () => {
        it('a single account query with no child layers', () => {
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        data(encoding: BASE_64)
                        lamports
                        space
                        ... on MintAccount {
                            decimals
                            isInitialized
                        }
                    }
                }
            `;
            expect(
                buildCallChain(source, {
                    address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                }),
            ).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [{ encoding: 'base64' }, { encoding: 'jsonParsed' }],
                        },
                    ],
                },
            ]);
        });
        it('a single account query with multiple child layers', () => {
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        data(encoding: BASE_64)
                        lamports
                        owner {
                            ... on TokenAccount {
                                amount
                            }
                        }
                        space
                        ... on MintAccount {
                            decimals
                            isInitialized
                        }
                    }
                }
            `;
            expect(
                buildCallChain(source, {
                    address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                }),
            ).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [{ encoding: 'base64' }, { encoding: 'jsonParsed' }],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [{ encoding: 'jsonParsed' }],
                        },
                    ],
                },
            ]);
        });
        it('multiple account queries with multiple child layers', () => {
            const source = /* GraphQL */ `
                query testQuery($addressA: Address!, $addressB: Address!) {
                    account(address: $addressA) {
                        data(encoding: BASE_64)
                        lamports
                        owner {
                            ... on TokenAccount {
                                amount
                            }
                        }
                        space
                        ... on MintAccount {
                            decimals
                            isInitialized
                        }
                    }
                    account(address: $addressB) {
                        lamports
                        owner {
                            ... on StakeAccount {
                                meta {
                                    rentExemptReserve
                                }
                            }
                            ... on VoteAccount {
                                commission
                            }
                        }
                        space
                        ... on LookupTableAccount {
                            deactivationSlot
                        }
                    }
                }
            `;
            expect(
                buildCallChain(source, {
                    addressA: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                    addressB: '2eBKpmtZkfGm3Vm1hwZaGv2yUh55WVhJfTutjAJ3VLr5',
                }),
            ).toMatchObject([
                {
                    accounts: [
                        {
                            address: '6jhiBso4naRBHdKBiD54XkH9Rp28DqdD6BXE9j2pf3SC',
                            argSets: [{ encoding: 'base64' }, { encoding: 'jsonParsed' }],
                        },
                        {
                            address: '2eBKpmtZkfGm3Vm1hwZaGv2yUh55WVhJfTutjAJ3VLr5',
                            argSets: [{ encoding: 'jsonParsed' }],
                        },
                    ],
                },
                {
                    accounts: [
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 0,
                            },
                            argSets: [{ encoding: 'jsonParsed' }],
                        },
                        {
                            address: {
                                parentFieldName: 'owner',
                                parentIndex: 1,
                            },
                            argSets: [{ encoding: 'jsonParsed' }],
                        },
                    ],
                },
            ]);
        });
    });
});
