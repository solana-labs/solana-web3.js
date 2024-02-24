/* eslint-disable sort-keys-fix/sort-keys-fix */

import { createDefaultRpcTransport, createRpc, createSolanaRpcApi, Rpc, SolanaRpcApi } from '@solana/rpc';

export function createLocalhostSolanaRpc(): Rpc<SolanaRpcApi> {
    return createRpc({
        api: createSolanaRpcApi(),
        transport: createDefaultRpcTransport({ url: 'http://127.0.0.1:8899' }),
    });
}

export const mockTransactionBase58 = {
    blockTime: 1699617771,
    meta: {
        computeUnitsConsumed: 2100,
        err: null,
        fee: 5000,
        innerInstructions: [],
        loadedAddresses: {
            readonly: [],
            writable: [],
        },
        logMessages: [
            'Program Vote111111111111111111111111111111111111111 invoke [1]',
            'Program Vote111111111111111111111111111111111111111 success',
        ],
        postBalances: [1007369134736714, 100000000000, 1],
        postTokenBalances: [],
        preBalances: [1007369134741714, 100000000000, 1],
        preTokenBalances: [],
        rewards: [],
        status: {
            Ok: null,
        },
    },
    slot: 257316391,
    transaction: [
        '6xNkTPi3A4y1wBWWx5ju992mhhQed8f7PvKdVC5TExCBVPsFKQREWEKEw7FH1sTtcTRBzfsbaKMwkToPGAh9Vux71etguU9F1zbPWcu4jm9R89JvfBHqgy6HNJxuP1bwGLjEVkCAU5mJXj2AwwY6rn6wbBGJk4vo8G6gpVUtXbctbF1ovKt2BitBzPdfwGF6oXkFCddPtj1YjQinNqhdCv56Wd2NeB6xhTKqDUhEfiyoqdvmEPAYsSqtfiiGRocWQCbu18r3jzT7bVRHPPVM7dXKJeV7sEvoxkmMPMrk7EcYBjeFGaJCaLnjizzb2T7sdaHQQQD5EwRPHLrUoKC5dZ6bkRLopbtzaWE9jAyCWJFUYCvNAkgDJbxHub3dgRdar6uDiKvBz5ZP3SW2KgbcfjeLpx6eq4NByyUuWfyNxEGgVnUiVLB',
        'base58',
    ],
};

export const mockTransactionBase64 = {
    blockTime: 1699617771,
    meta: {
        computeUnitsConsumed: 2100,
        err: null,
        fee: 5000,
        innerInstructions: [],
        loadedAddresses: {
            readonly: [],
            writable: [],
        },
        logMessages: [
            'Program Vote111111111111111111111111111111111111111 invoke [1]',
            'Program Vote111111111111111111111111111111111111111 success',
        ],
        postBalances: [1007369134736714, 100000000000, 1],
        postTokenBalances: [],
        preBalances: [1007369134741714, 100000000000, 1],
        preTokenBalances: [],
        rewards: [],
        status: {
            Ok: null,
        },
    },
    slot: 257316391,
    transaction: [
        'AepkROU+YmVQzntENpmquZ1qpkha7UFbM7otQT4fBnBGj9jnh0Ajpi5udBvmgy0Xl+oHCVoVBmyb6Sefe62OPAABAAEDCXTeVPd6+prT1HSQn2zglbliOjWaXQjMgHuKkt1eH5YKiAaVN9osvzAWT9Si70lMmML05TxzF4KLoavohN5bhAdhSB01dHS7fE12JOvTvbPYNV5z0RBD/A2jU4AAAAAAagAuoluUJsP7XqnRIG7xK7Enle/1dyqE6zCdyAUQJ08BAgIBAHQMAAAAB1ZWDwAAAAAfAR8BHgEdARwBGwEaARkBGAEXARYBFQEUARMBEgERARABDwEOAQ0BDAELAQoBCQEIAQcBBgEFAQQBAwECAQHSQS4WTFXgfy7GPfwboTLrsk3OHMs3lPgWrEMfMaT3sQHrG05lAAAAAA==',
        'base64',
    ],
};

export const mockTransactionGeneric = {
    blockTime: 1699618507,
    meta: {
        computeUnitsConsumed: 53355,
        err: null,
        fee: 5000,
        innerInstructions: [],
        logMessages: [
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 4263 of 480000 compute units',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 4461 of 475737 compute units',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 4504 of 471276 compute units',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 4600 of 466772 compute units',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 4213 of 462172 compute units',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 4390 of 457959 compute units',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 4392 of 453569 compute units',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 4703 of 449177 compute units',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 4509 of 444474 compute units',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 4240 of 439965 compute units',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 4471 of 435725 compute units',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 4459 of 431254 compute units',
            'Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success',
            'Program ComputeBudget111111111111111111111111111111 invoke [1]',
            'Program ComputeBudget111111111111111111111111111111 success',
        ],
        postBalances: [
            113383490000, 23942400, 23942400, 23942400, 23942400, 23942400, 23942400, 23942400, 23942400, 23942400,
            23942400, 23942400, 23942400, 1, 1169280, 1141440,
        ],
        postTokenBalances: [],
        preBalances: [
            113383495000, 23942400, 23942400, 23942400, 23942400, 23942400, 23942400, 23942400, 23942400, 23942400,
            23942400, 23942400, 23942400, 1, 1169280, 1141440,
        ],
        preTokenBalances: [],
        rewards: [],
        status: {
            Ok: null,
        },
    },
    slot: 257318391,
    transaction: {
        message: {
            accountKeys: [
                {
                    pubkey: 'HUZu4xMSHbxTWbkXR6jkGdjvDPJLjrpSNXSoUFBRgjWs',
                    signer: true,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: '3LuSbvThg5STSvcqTFNG74pifPs9cz2kT6msLA7trkiz',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: '3uwrCNiVJrUU4AfUyoAABHLMGgdtzR6Fnk9LFrAudcUd',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: '4JnBkEHGCS86CkrLSkZiLWYFfVtsvUhXGd7BYF1pQk2T',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: '5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: '6FnzHuB86M4FVp4UPzgYHb9xi9SxhFcpd1YFnmKKSzhh',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'BfrLgSZLBNpWvytEcurngBFdkbEP5YMyjTgs8gb9DLMM',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'CbemEDzti5Vdh5JdT6Vj7cGEDfSLvvVyNRPveMGrt45z',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'DLs1QkLjp92HGRU899J6eNjBn7VK3cLGg8NhMpqfJMjU',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'DMyZyzfNR1uhqYcFGrNftirkveCbyNVLnCB8HgShYz4V',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'Eag4Uc8nrEfwyXykuoBwCaigW1oQu9DkuiAwr6qkw9QK',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'EfCD8rMxH7rUNo8A5AXmqvdXfgTCL5V8hAtSDW49KePb',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'HYEgRDsZVSzPzZor1RaeUicaKBQcGGxgf1MCn9KUtaqA',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'ComputeBudget111111111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'SysvarC1ock11111111111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
            ],
            instructions: [
                {
                    accounts: [
                        'HUZu4xMSHbxTWbkXR6jkGdjvDPJLjrpSNXSoUFBRgjWs',
                        'DMyZyzfNR1uhqYcFGrNftirkveCbyNVLnCB8HgShYz4V',
                        'SysvarC1ock11111111111111111111111111111111',
                    ],
                    data: '6mJFQCt94hG4CKNYKgVcwo7gRuVPWDv2unmQd4jq8zWK3wQZG54k2b',
                    programId: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
                    stackHeight: null,
                },
                {
                    accounts: [
                        'HUZu4xMSHbxTWbkXR6jkGdjvDPJLjrpSNXSoUFBRgjWs',
                        'CbemEDzti5Vdh5JdT6Vj7cGEDfSLvvVyNRPveMGrt45z',
                        'SysvarC1ock11111111111111111111111111111111',
                    ],
                    data: '6mJFQCt94hG4CKNYKgVcwujWTHqRu8S9Jpua28JRHAfiNoVwoQUqwV',
                    programId: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
                    stackHeight: null,
                },
                {
                    accounts: [
                        'HUZu4xMSHbxTWbkXR6jkGdjvDPJLjrpSNXSoUFBRgjWs',
                        '6FnzHuB86M4FVp4UPzgYHb9xi9SxhFcpd1YFnmKKSzhh',
                        'SysvarC1ock11111111111111111111111111111111',
                    ],
                    data: '6mJFQCt94hG4CKNYKgVcwrzrkWH6hYPqjdWj5udRaTyxZzQpJ1CLpP',
                    programId: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
                    stackHeight: null,
                },
                {
                    accounts: [
                        'HUZu4xMSHbxTWbkXR6jkGdjvDPJLjrpSNXSoUFBRgjWs',
                        '3uwrCNiVJrUU4AfUyoAABHLMGgdtzR6Fnk9LFrAudcUd',
                        'SysvarC1ock11111111111111111111111111111111',
                    ],
                    data: '6mJFQCt94hG4CKNYKgVcwbtf9bEjkQBS9YADJiEpsmFLPiPiXUB1fd',
                    programId: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
                    stackHeight: null,
                },
                {
                    accounts: [
                        'HUZu4xMSHbxTWbkXR6jkGdjvDPJLjrpSNXSoUFBRgjWs',
                        'HYEgRDsZVSzPzZor1RaeUicaKBQcGGxgf1MCn9KUtaqA',
                        'SysvarC1ock11111111111111111111111111111111',
                    ],
                    data: '6mJFQCt94hG4CKNYKgVcwbgw281VXtZiGZpkiRGPJjpLpufuRA2znK',
                    programId: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
                    stackHeight: null,
                },
                {
                    accounts: [
                        'HUZu4xMSHbxTWbkXR6jkGdjvDPJLjrpSNXSoUFBRgjWs',
                        '5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7',
                        'SysvarC1ock11111111111111111111111111111111',
                    ],
                    data: '6mJFQCt94hG4CKNYKgVcwbjdVM7NzaewBokEtqBPiz7sEUJG4uaXhq',
                    programId: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
                    stackHeight: null,
                },
                {
                    accounts: [
                        'HUZu4xMSHbxTWbkXR6jkGdjvDPJLjrpSNXSoUFBRgjWs',
                        '3LuSbvThg5STSvcqTFNG74pifPs9cz2kT6msLA7trkiz',
                        'SysvarC1ock11111111111111111111111111111111',
                    ],
                    data: '6mJFQCt94hG4CKNYKgVcweejgvAyYMaMZv5DHLeAKv4iDYvwXWst7R',
                    programId: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
                    stackHeight: null,
                },
                {
                    accounts: [
                        'HUZu4xMSHbxTWbkXR6jkGdjvDPJLjrpSNXSoUFBRgjWs',
                        'BfrLgSZLBNpWvytEcurngBFdkbEP5YMyjTgs8gb9DLMM',
                        'SysvarC1ock11111111111111111111111111111111',
                    ],
                    data: '6mJFQCt94hG4CKNYKgVcwfCdRcjR1XiBBejZ8wWhawB14y76Fy3waX',
                    programId: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
                    stackHeight: null,
                },
                {
                    accounts: [
                        'HUZu4xMSHbxTWbkXR6jkGdjvDPJLjrpSNXSoUFBRgjWs',
                        'DLs1QkLjp92HGRU899J6eNjBn7VK3cLGg8NhMpqfJMjU',
                        'SysvarC1ock11111111111111111111111111111111',
                    ],
                    data: '6mJFQCt94hG4CKNYKgVcwrS6dBfd33GmL7Uq6xuc6thGmeWXzyoSF1',
                    programId: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
                    stackHeight: null,
                },
                {
                    accounts: [
                        'HUZu4xMSHbxTWbkXR6jkGdjvDPJLjrpSNXSoUFBRgjWs',
                        'Eag4Uc8nrEfwyXykuoBwCaigW1oQu9DkuiAwr6qkw9QK',
                        'SysvarC1ock11111111111111111111111111111111',
                    ],
                    data: '6mJFQCt94hG4CKNYKgVcwmFG26LaHMh1WU2xgzDpnFPNrmzhJ1jGUP',
                    programId: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
                    stackHeight: null,
                },
                {
                    accounts: [
                        'HUZu4xMSHbxTWbkXR6jkGdjvDPJLjrpSNXSoUFBRgjWs',
                        '4JnBkEHGCS86CkrLSkZiLWYFfVtsvUhXGd7BYF1pQk2T',
                        'SysvarC1ock11111111111111111111111111111111',
                    ],
                    data: '6mJFQCt94hG4CKNYKgVcwxvsFAVu1Kh7RwbWACySGJGX5B6yPjkxHD',
                    programId: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
                    stackHeight: null,
                },
                {
                    accounts: [
                        'HUZu4xMSHbxTWbkXR6jkGdjvDPJLjrpSNXSoUFBRgjWs',
                        'EfCD8rMxH7rUNo8A5AXmqvdXfgTCL5V8hAtSDW49KePb',
                        'SysvarC1ock11111111111111111111111111111111',
                    ],
                    data: '6mJFQCt94hG4CKNYKgVcwt66hLszPZu81oa7B7FhnA8YmRE415Kdxj',
                    programId: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
                    stackHeight: null,
                },
                {
                    accounts: [],
                    data: 'E6YYnj',
                    programId: 'ComputeBudget111111111111111111111111111111',
                    stackHeight: null,
                },
            ],
            recentBlockhash: 'ETbinvUP8hqHssm4wHePZnEYupJncfuqn8YdY9uKkYow',
        },
        signatures: ['DC4yP5xEUhHuzSDq8fk2TznnMxy4DJm4M5qSzmnuPngLtnn8jH8qu4MEjmie2piiksEGwe98CawKUHuR7VQJ1Nt'],
    },
    version: 'legacy',
};

export const mockTransactionAddressLookup = {
    blockTime: 1699614307,
    meta: {
        computeUnitsConsumed: 1200,
        err: null,
        fee: 6600,
        innerInstructions: [
            {
                index: 2,
                instructions: [
                    {
                        parsed: {
                            info: {
                                destination: 'Dm8oknt7wHtvkVZKgQHtDFqgdHjL89cAoXyiPavK6DcU',
                                lamports: 445440,
                                source: '2fZT6MLRvvanGDWwP6ydAt1jkftDhSW7Du5Lo4uY314N',
                            },
                            type: 'transfer',
                        },
                        program: 'system',
                        programId: '11111111111111111111111111111111',
                        stackHeight: 2,
                    },
                ],
            },
        ],
        logMessages: [
            'Program ComputeBudget111111111111111111111111111111 invoke [1]',
            'Program ComputeBudget111111111111111111111111111111 success',
            'Program ComputeBudget111111111111111111111111111111 invoke [1]',
            'Program ComputeBudget111111111111111111111111111111 success',
            'Program AddressLookupTab1e1111111111111111111111111 invoke [1]',
            'Program 11111111111111111111111111111111 invoke [2]',
            'Program 11111111111111111111111111111111 success',
            'Program AddressLookupTab1e1111111111111111111111111 success',
        ],
        postBalances: [998247520, 1726080, 1, 1, 1],
        postTokenBalances: [],
        preBalances: [998699560, 1280640, 1, 1, 1],
        preTokenBalances: [],
        rewards: [],
        status: {
            Ok: null,
        },
    },
    slot: 257306980,
    transaction: {
        message: {
            accountKeys: [
                {
                    pubkey: '2fZT6MLRvvanGDWwP6ydAt1jkftDhSW7Du5Lo4uY314N',
                    signer: true,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'Dm8oknt7wHtvkVZKgQHtDFqgdHjL89cAoXyiPavK6DcU',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'ComputeBudget111111111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'AddressLookupTab1e1111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: '11111111111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
            ],
            addressTableLookups: [],
            instructions: [
                {
                    accounts: [],
                    data: '3QBcnUb9zKM9',
                    programId: 'ComputeBudget111111111111111111111111111111',
                    stackHeight: null,
                },
                {
                    accounts: [],
                    data: 'Fj2Eoy',
                    programId: 'ComputeBudget111111111111111111111111111111',
                    stackHeight: null,
                },
                {
                    parsed: {
                        info: {
                            lookupTableAccount: 'Dm8oknt7wHtvkVZKgQHtDFqgdHjL89cAoXyiPavK6DcU',
                            lookupTableAuthority: '2fZT6MLRvvanGDWwP6ydAt1jkftDhSW7Du5Lo4uY314N',
                            newAddresses: [
                                '2fZT6MLRvvanGDWwP6ydAt1jkftDhSW7Du5Lo4uY314N',
                                '11111111111111111111111111111111',
                            ],
                            payerAccount: '2fZT6MLRvvanGDWwP6ydAt1jkftDhSW7Du5Lo4uY314N',
                            systemProgram: '11111111111111111111111111111111',
                        },
                        type: 'extendLookupTable',
                    },
                    program: 'address-lookup-table',
                    programId: 'AddressLookupTab1e1111111111111111111111111',
                    stackHeight: null,
                },
            ],
            recentBlockhash: '2s1nPVeBAsh3cMuhyJxeZr3thiZiea8851pDYH3Py7mi',
        },
        signatures: ['2oitdwWTduGvnYJUzFg3e8vgeB3LnxXGxrWKGiYFyM5HRHQvtDmZKA7yf8emHZpw8NkqjwnFskBeYTy1W8Zv5eMR'],
    },
    version: 0,
};

export const mockTransactionSystem = {
    blockTime: 1699618622,
    meta: {
        computeUnitsConsumed: 284289,
        err: null,
        fee: 10000,
        innerInstructions: [
            {
                index: 2,
                instructions: [
                    {
                        parsed: {
                            info: {
                                extensionTypes: ['immutableOwner'],
                                mint: 'FX5iUBr2XdvULwa2trYRbPMHpnfxz28DrkEsVWSuPJMV',
                            },
                            type: 'getAccountDataSize',
                        },
                        program: 'spl-token',
                        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        stackHeight: 2,
                    },
                    {
                        parsed: {
                            info: {
                                lamports: 2039280,
                                newAccount: 'DNDx4t174ASMR7yNA5HQZppaU4WaAEQa3x1HphLHBDDU',
                                owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                source: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                                space: 165,
                            },
                            type: 'createAccount',
                        },
                        program: 'system',
                        programId: '11111111111111111111111111111111',
                        stackHeight: 2,
                    },
                    {
                        parsed: {
                            info: {
                                account: 'DNDx4t174ASMR7yNA5HQZppaU4WaAEQa3x1HphLHBDDU',
                            },
                            type: 'initializeImmutableOwner',
                        },
                        program: 'spl-token',
                        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        stackHeight: 2,
                    },
                    {
                        parsed: {
                            info: {
                                account: 'DNDx4t174ASMR7yNA5HQZppaU4WaAEQa3x1HphLHBDDU',
                                mint: 'FX5iUBr2XdvULwa2trYRbPMHpnfxz28DrkEsVWSuPJMV',
                                owner: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                            },
                            type: 'initializeAccount3',
                        },
                        program: 'spl-token',
                        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        stackHeight: 2,
                    },
                ],
            },
            {
                index: 4,
                instructions: [
                    {
                        parsed: {
                            info: {
                                amount: '1990000',
                                authority: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                                destination: '7ZV4v2Q1krNiwmYvc7K4TzJ8jpK9HSW4wrH6W9ngSLH7',
                                source: 'BeFuHRNFWT5q8qS5jF35awgFR88vtE33UWxDGxQrrJCZ',
                            },
                            type: 'transfer',
                        },
                        program: 'spl-token',
                        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        stackHeight: 2,
                    },
                    {
                        accounts: [
                            'CmakeM5y4gikp7GyTZRps2RwvC1qZ4HQNX1AwsRgwqrQ',
                            'H6ojAjBeHu821EvH1sHggoxFq98wMBa9Ka99LMHgVie8',
                            'Eo6HqnrR5mWoBuoksxQtzjL5A4txBEH8KCiTRykZPQn4',
                            'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                            'FX5iUBr2XdvULwa2trYRbPMHpnfxz28DrkEsVWSuPJMV',
                            'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                            '8cTmTFTvMrELxXn1wKJeU45WiGf7suAmMJA8WrKe3TuW',
                            'EAsdRhCDjRj7G4U5GjNG7b5mpMvpBfiDNiMTMM9JpQqn',
                            'CxST73mXAHuH5n18jZ3xFgthDot9XLJGWXfi2z6MBuqT',
                            'GP1xRUzahZem3X2uh7pYZNTeryrQF1tDXRKH76FX1i1V',
                            '5GCz3rtxi1LoWiozqXRMNvPWhybQgEdPwLrMKXH7Gm4E',
                            'A5JSBNA1N824Y7ZtQ98oBUVNB6wjThTvbUCTQyHfK5NC',
                            '3kDKLKbdEaVV2XnhdyshthzRYcknrLLk1Fizft7LcXAG',
                            'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            '11111111111111111111111111111111',
                            'SysvarS1otHashes111111111111111111111111111',
                        ],
                        data: '9ZxXEgRKtxM',
                        programId: 'CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR',
                        stackHeight: 2,
                    },
                    {
                        accounts: [
                            '8cTmTFTvMrELxXn1wKJeU45WiGf7suAmMJA8WrKe3TuW',
                            'FX5iUBr2XdvULwa2trYRbPMHpnfxz28DrkEsVWSuPJMV',
                            'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                            'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                            'H6ojAjBeHu821EvH1sHggoxFq98wMBa9Ka99LMHgVie8',
                            '11111111111111111111111111111111',
                        ],
                        data: '3LnyAmGDjLoXr8a2pYMDkNpLpnxQUUk5wW8Cnm6kva9LBqTwQxrmEfsSCjkD6cUtu1SygE2aRqPmFDx9bA3BESL1EVy6KVc7GPuGUruUcn254bRgJwwYDFL423L9mrRXeh9wLVk8H9s6MhX6qmMjM9Fu6Lw9No1oBXgvGPk1nxWXCAymTVKysqiu7Ys1ckhSKtTyMjY4sGtMsCWjt992DjfUBLoDgUHaw4m9M4zzVAUsMUgC6Svr1mzJAJ1Vu3FNMifMcdGPW3qmx7VS16oYEs1nmB28ey8X25XDfLmkrB',
                        programId: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                        stackHeight: 3,
                    },
                    {
                        parsed: {
                            info: {
                                destination: '8cTmTFTvMrELxXn1wKJeU45WiGf7suAmMJA8WrKe3TuW',
                                lamports: 15616720,
                                source: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                            },
                            type: 'transfer',
                        },
                        program: 'system',
                        programId: '11111111111111111111111111111111',
                        stackHeight: 4,
                    },
                    {
                        parsed: {
                            info: {
                                account: '8cTmTFTvMrELxXn1wKJeU45WiGf7suAmMJA8WrKe3TuW',
                                space: 679,
                            },
                            type: 'allocate',
                        },
                        program: 'system',
                        programId: '11111111111111111111111111111111',
                        stackHeight: 4,
                    },
                    {
                        parsed: {
                            info: {
                                account: '8cTmTFTvMrELxXn1wKJeU45WiGf7suAmMJA8WrKe3TuW',
                                owner: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                            },
                            type: 'assign',
                        },
                        program: 'system',
                        programId: '11111111111111111111111111111111',
                        stackHeight: 4,
                    },
                    {
                        accounts: [
                            'EAsdRhCDjRj7G4U5GjNG7b5mpMvpBfiDNiMTMM9JpQqn',
                            'FX5iUBr2XdvULwa2trYRbPMHpnfxz28DrkEsVWSuPJMV',
                            'H6ojAjBeHu821EvH1sHggoxFq98wMBa9Ka99LMHgVie8',
                            'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                            'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                            '8cTmTFTvMrELxXn1wKJeU45WiGf7suAmMJA8WrKe3TuW',
                            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            '11111111111111111111111111111111',
                        ],
                        data: 'xQfWWpLr8ajWF',
                        programId: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                        stackHeight: 3,
                    },
                    {
                        parsed: {
                            info: {
                                destination: 'EAsdRhCDjRj7G4U5GjNG7b5mpMvpBfiDNiMTMM9JpQqn',
                                lamports: 2853600,
                                source: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                            },
                            type: 'transfer',
                        },
                        program: 'system',
                        programId: '11111111111111111111111111111111',
                        stackHeight: 4,
                    },
                    {
                        parsed: {
                            info: {
                                account: 'EAsdRhCDjRj7G4U5GjNG7b5mpMvpBfiDNiMTMM9JpQqn',
                                space: 282,
                            },
                            type: 'allocate',
                        },
                        program: 'system',
                        programId: '11111111111111111111111111111111',
                        stackHeight: 4,
                    },
                    {
                        parsed: {
                            info: {
                                account: 'EAsdRhCDjRj7G4U5GjNG7b5mpMvpBfiDNiMTMM9JpQqn',
                                owner: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                            },
                            type: 'assign',
                        },
                        program: 'system',
                        programId: '11111111111111111111111111111111',
                        stackHeight: 4,
                    },
                    {
                        parsed: {
                            info: {
                                authorityType: 'mintTokens',
                                mint: 'FX5iUBr2XdvULwa2trYRbPMHpnfxz28DrkEsVWSuPJMV',
                                multisigAuthority: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                                newAuthority: 'EAsdRhCDjRj7G4U5GjNG7b5mpMvpBfiDNiMTMM9JpQqn',
                                signers: ['AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r'],
                            },
                            type: 'setAuthority',
                        },
                        program: 'spl-token',
                        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        stackHeight: 4,
                    },
                    {
                        parsed: {
                            info: {
                                authorityType: 'freezeAccount',
                                mint: 'FX5iUBr2XdvULwa2trYRbPMHpnfxz28DrkEsVWSuPJMV',
                                multisigAuthority: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                                newAuthority: 'EAsdRhCDjRj7G4U5GjNG7b5mpMvpBfiDNiMTMM9JpQqn',
                                signers: ['AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r'],
                            },
                            type: 'setAuthority',
                        },
                        program: 'spl-token',
                        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        stackHeight: 4,
                    },
                    {
                        accounts: [
                            '8cTmTFTvMrELxXn1wKJeU45WiGf7suAmMJA8WrKe3TuW',
                            'H6ojAjBeHu821EvH1sHggoxFq98wMBa9Ka99LMHgVie8',
                        ],
                        data: '3DhU62yedutwviTVGMfUJGHobmkNWvigVK7ZTMWwoUStEZuf8jH1',
                        programId: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                        stackHeight: 3,
                    },
                    {
                        accounts: [
                            '8cTmTFTvMrELxXn1wKJeU45WiGf7suAmMJA8WrKe3TuW',
                            'H6ojAjBeHu821EvH1sHggoxFq98wMBa9Ka99LMHgVie8',
                            'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                            '3kDKLKbdEaVV2XnhdyshthzRYcknrLLk1Fizft7LcXAG',
                            'GP1xRUzahZem3X2uh7pYZNTeryrQF1tDXRKH76FX1i1V',
                            '5GCz3rtxi1LoWiozqXRMNvPWhybQgEdPwLrMKXH7Gm4E',
                            'A5JSBNA1N824Y7ZtQ98oBUVNB6wjThTvbUCTQyHfK5NC',
                            'CxST73mXAHuH5n18jZ3xFgthDot9XLJGWXfi2z6MBuqT',
                        ],
                        data: 'Z',
                        programId: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                        stackHeight: 3,
                    },
                ],
            },
        ],
        logMessages: [
            'Program 11111111111111111111111111111111 invoke [1]',
            'Program 11111111111111111111111111111111 success',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [1]',
            'Program log: Instruction: InitializeMint',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 2967 of 999850 compute units',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
            'Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL invoke [1]',
            'Program log: Create',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
            'Program log: Instruction: GetAccountDataSize',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 1622 of 991520 compute units',
            'Program return: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA pQAAAAAAAAA=',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
            'Program 11111111111111111111111111111111 invoke [2]',
            'Program 11111111111111111111111111111111 success',
            'Program log: Initialize the associated token account',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
            'Program log: Instruction: InitializeImmutableOwner',
            'Program log: Please upgrade to SPL Token 2022 for immutable owner support',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 1405 of 984880 compute units',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
            'Program log: Instruction: InitializeAccount3',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4241 of 981000 compute units',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
            'Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL consumed 20407 of 996883 compute units',
            'Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL success',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [1]',
            'Program log: Instruction: MintTo',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4536 of 976476 compute units',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
            'Program Drop9NhG6Mm6oQmPnzr8FQP6rWaPiwFkin59SeAKApLc invoke [1]',
            'Program log: Instruction: MintNft',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
            'Program log: Instruction: Transfer',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4645 of 946736 compute units',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
            'Program CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR invoke [2]',
            'Program log: Instruction: Mint',
            'Program log: (Deprecated as of 1.0.0) Use MintV2 instead',
            'Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s invoke [3]',
            'Program log: IX: Create Metadata Accounts v3',
            'Program 11111111111111111111111111111111 invoke [4]',
            'Program 11111111111111111111111111111111 success',
            'Program log: Allocate space for the account',
            'Program 11111111111111111111111111111111 invoke [4]',
            'Program 11111111111111111111111111111111 success',
            'Program log: Assign the account to the owning program',
            'Program 11111111111111111111111111111111 invoke [4]',
            'Program 11111111111111111111111111111111 success',
            'Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s consumed 42280 of 892008 compute units',
            'Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s success',
            'Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s invoke [3]',
            'Program log: V3 Create Master Edition',
            'Program log: Transfer 2853600 lamports to the new account',
            'Program 11111111111111111111111111111111 invoke [4]',
            'Program 11111111111111111111111111111111 success',
            'Program log: Allocate space for the account',
            'Program 11111111111111111111111111111111 invoke [4]',
            'Program 11111111111111111111111111111111 success',
            'Program log: Assign the account to the owning program',
            'Program 11111111111111111111111111111111 invoke [4]',
            'Program 11111111111111111111111111111111 success',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [4]',
            'Program log: Instruction: SetAuthority',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 3090 of 801966 compute units',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [4]',
            'Program log: Instruction: SetAuthority',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 3250 of 795631 compute units',
            'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
            'Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s consumed 53370 of 844890 compute units',
            'Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s success',
            'Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s invoke [3]',
            'Program log: IX: Update Metadata Accounts v2',
            'Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s consumed 18940 of 789213 compute units',
            'Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s success',
            'Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s invoke [3]',
            'Program log: IX: Set and Verify Collection',
            'Program log: Clean write collection metadata',
            'Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s consumed 43054 of 765463 compute units',
            'Program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s success',
            'Program CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR consumed 205947 of 925016 compute units',
            'Program CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR success',
            'Program Drop9NhG6Mm6oQmPnzr8FQP6rWaPiwFkin59SeAKApLc consumed 256229 of 971940 compute units',
            'Program Drop9NhG6Mm6oQmPnzr8FQP6rWaPiwFkin59SeAKApLc success',
        ],
        postBalances: [
            720480960, 1461600, 5616720, 2039280, 15616720, 2039280, 18144720, 2039280, 2853600, 10203360, 0, 1,
            4108677884, 1224960, 2345520, 2853600, 731913600, 1141440, 1134480, 1141440, 1461600, 1141440, 1169280,
            1009200, 143487360, 934087680,
        ],
        postTokenBalances: [
            {
                accountIndex: 3,
                mint: 'HvCDUjehP8xNJfCGQxmTWQoEueYApaCL9sJTTBFeS3f4',
                owner: '3kDKLKbdEaVV2XnhdyshthzRYcknrLLk1Fizft7LcXAG',
                programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                uiTokenAmount: {
                    amount: '1216420792',
                    decimals: 6,
                    uiAmount: 1216.420792,
                    uiAmountString: '1216.420792',
                },
            },
            {
                accountIndex: 5,
                mint: 'HvCDUjehP8xNJfCGQxmTWQoEueYApaCL9sJTTBFeS3f4',
                owner: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                uiTokenAmount: {
                    amount: '1068410181062',
                    decimals: 6,
                    uiAmount: 1068410.181062,
                    uiAmountString: '1068410.181062',
                },
            },
            {
                accountIndex: 7,
                mint: 'FX5iUBr2XdvULwa2trYRbPMHpnfxz28DrkEsVWSuPJMV',
                owner: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                uiTokenAmount: {
                    amount: '1',
                    decimals: 0,
                    uiAmount: 1.0,
                    uiAmountString: '1',
                },
            },
        ],
        preBalances: [
            742462160, 0, 5616720, 2039280, 0, 2039280, 18144720, 0, 0, 10203360, 0, 1, 4108677884, 1224960, 2345520,
            2853600, 731913600, 1141440, 1134480, 1141440, 1461600, 1141440, 1169280, 1009200, 143487360, 934087680,
        ],
        preTokenBalances: [
            {
                accountIndex: 3,
                mint: 'HvCDUjehP8xNJfCGQxmTWQoEueYApaCL9sJTTBFeS3f4',
                owner: '3kDKLKbdEaVV2XnhdyshthzRYcknrLLk1Fizft7LcXAG',
                programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                uiTokenAmount: {
                    amount: '1214430792',
                    decimals: 6,
                    uiAmount: 1214.430792,
                    uiAmountString: '1214.430792',
                },
            },
            {
                accountIndex: 5,
                mint: 'HvCDUjehP8xNJfCGQxmTWQoEueYApaCL9sJTTBFeS3f4',
                owner: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                uiTokenAmount: {
                    amount: '1068412171062',
                    decimals: 6,
                    uiAmount: 1068412.171062,
                    uiAmountString: '1068412.171062',
                },
            },
        ],
        rewards: [],
        status: {
            Ok: null,
        },
    },
    slot: 257318704,
    transaction: {
        message: {
            accountKeys: [
                {
                    pubkey: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                    signer: true,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'FX5iUBr2XdvULwa2trYRbPMHpnfxz28DrkEsVWSuPJMV',
                    signer: true,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: '5GCz3rtxi1LoWiozqXRMNvPWhybQgEdPwLrMKXH7Gm4E',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: '7ZV4v2Q1krNiwmYvc7K4TzJ8jpK9HSW4wrH6W9ngSLH7',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: '8cTmTFTvMrELxXn1wKJeU45WiGf7suAmMJA8WrKe3TuW',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'BeFuHRNFWT5q8qS5jF35awgFR88vtE33UWxDGxQrrJCZ',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'CmakeM5y4gikp7GyTZRps2RwvC1qZ4HQNX1AwsRgwqrQ',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'DNDx4t174ASMR7yNA5HQZppaU4WaAEQa3x1HphLHBDDU',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'EAsdRhCDjRj7G4U5GjNG7b5mpMvpBfiDNiMTMM9JpQqn',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'Eo6HqnrR5mWoBuoksxQtzjL5A4txBEH8KCiTRykZPQn4',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'H6ojAjBeHu821EvH1sHggoxFq98wMBa9Ka99LMHgVie8',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: '11111111111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: '3kDKLKbdEaVV2XnhdyshthzRYcknrLLk1Fizft7LcXAG',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: '3pNTNq5PaUhDLke4m4SKGctvxMedEv4rbQrPQu9zUMPG',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: '9Cp66QGfrmw1jGgrKEuEqpLzWJtX6yYx7fz63haJWcoq',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'A5JSBNA1N824Y7ZtQ98oBUVNB6wjThTvbUCTQyHfK5NC',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'CxST73mXAHuH5n18jZ3xFgthDot9XLJGWXfi2z6MBuqT',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'Drop9NhG6Mm6oQmPnzr8FQP6rWaPiwFkin59SeAKApLc',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'GP1xRUzahZem3X2uh7pYZNTeryrQF1tDXRKH76FX1i1V',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'SysvarC1ock11111111111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'SysvarRent111111111111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'SysvarS1otHashes111111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
            ],
            instructions: [
                {
                    parsed: {
                        info: {
                            lamports: 1461600,
                            newAccount: 'FX5iUBr2XdvULwa2trYRbPMHpnfxz28DrkEsVWSuPJMV',
                            owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            source: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                            space: 82,
                        },
                        type: 'createAccount',
                    },
                    program: 'system',
                    programId: '11111111111111111111111111111111',
                    stackHeight: null,
                },
                {
                    parsed: {
                        info: {
                            decimals: 0,
                            freezeAuthority: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                            mint: 'FX5iUBr2XdvULwa2trYRbPMHpnfxz28DrkEsVWSuPJMV',
                            mintAuthority: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                            rentSysvar: 'SysvarRent111111111111111111111111111111111',
                        },
                        type: 'initializeMint',
                    },
                    program: 'spl-token',
                    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    stackHeight: null,
                },
                {
                    parsed: {
                        info: {
                            account: 'DNDx4t174ASMR7yNA5HQZppaU4WaAEQa3x1HphLHBDDU',
                            mint: 'FX5iUBr2XdvULwa2trYRbPMHpnfxz28DrkEsVWSuPJMV',
                            source: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                            systemProgram: '11111111111111111111111111111111',
                            tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            wallet: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                        },
                        type: 'create',
                    },
                    program: 'spl-associated-token-account',
                    programId: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
                    stackHeight: null,
                },
                {
                    parsed: {
                        info: {
                            account: 'DNDx4t174ASMR7yNA5HQZppaU4WaAEQa3x1HphLHBDDU',
                            amount: '1',
                            mint: 'FX5iUBr2XdvULwa2trYRbPMHpnfxz28DrkEsVWSuPJMV',
                            mintAuthority: 'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                        },
                        type: 'mintTo',
                    },
                    program: 'spl-token',
                    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    stackHeight: null,
                },
                {
                    accounts: [
                        'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                        '9Cp66QGfrmw1jGgrKEuEqpLzWJtX6yYx7fz63haJWcoq',
                        'Eo6HqnrR5mWoBuoksxQtzjL5A4txBEH8KCiTRykZPQn4',
                        'CmakeM5y4gikp7GyTZRps2RwvC1qZ4HQNX1AwsRgwqrQ',
                        'H6ojAjBeHu821EvH1sHggoxFq98wMBa9Ka99LMHgVie8',
                        'FX5iUBr2XdvULwa2trYRbPMHpnfxz28DrkEsVWSuPJMV',
                        'AH7F2EPHXWhfF5yc7xnv1zPbwz3YqD6CtAqbCyE9dy7r',
                        '8cTmTFTvMrELxXn1wKJeU45WiGf7suAmMJA8WrKe3TuW',
                        'EAsdRhCDjRj7G4U5GjNG7b5mpMvpBfiDNiMTMM9JpQqn',
                        'CxST73mXAHuH5n18jZ3xFgthDot9XLJGWXfi2z6MBuqT',
                        '3kDKLKbdEaVV2XnhdyshthzRYcknrLLk1Fizft7LcXAG',
                        'GP1xRUzahZem3X2uh7pYZNTeryrQF1tDXRKH76FX1i1V',
                        '5GCz3rtxi1LoWiozqXRMNvPWhybQgEdPwLrMKXH7Gm4E',
                        'A5JSBNA1N824Y7ZtQ98oBUVNB6wjThTvbUCTQyHfK5NC',
                        'CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR',
                        'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        'SysvarC1ock11111111111111111111111111111111',
                        '11111111111111111111111111111111',
                        'SysvarS1otHashes111111111111111111111111111',
                        '3pNTNq5PaUhDLke4m4SKGctvxMedEv4rbQrPQu9zUMPG',
                        'BeFuHRNFWT5q8qS5jF35awgFR88vtE33UWxDGxQrrJCZ',
                        '7ZV4v2Q1krNiwmYvc7K4TzJ8jpK9HSW4wrH6W9ngSLH7',
                    ],
                    data: 'T5oA9o97wiSHHPKwc58huJ',
                    programId: 'Drop9NhG6Mm6oQmPnzr8FQP6rWaPiwFkin59SeAKApLc',
                    stackHeight: null,
                },
            ],
            recentBlockhash: 'bFotro8geZ9HJbE3SUJ77yQuCaECpRidocDapgM2BNW',
        },
        signatures: [
            '3mjQHJqKBrWe2LnUYsx3a7Vr68qQHCW1ru2m2ycuiFfcihcpXdQ7KqKrjqKyQkmN5jjcvMeBvJDsSTiaXzoSWXSF',
            '2Tfh6G4R9cxdtFDbCvnNR9QKjJX8o19ux4WwYiZsx9xRcAKKmZg88BqgQRJf2mrZBj1PuTPVCspWTDqqaNZAdsPJ',
        ],
    },
    version: 'legacy',
};

// Lots of good token instructions in this one
export const mockTransactionToken = mockTransactionSystem;

export const mockTransactionStake = {
    blockTime: 1699617128,
    meta: {
        computeUnitsConsumed: 20907,
        err: null,
        fee: 15000,
        innerInstructions: [],
        logMessages: [
            'Program 11111111111111111111111111111111 invoke [1]',
            'Program 11111111111111111111111111111111 success',
            'Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr invoke [1]',
            'Program log: Signed by BfdPksUrBeWBQp8ati1uoFqavi59dbmVJ7BEB3e6NeAg',
            'Program log: Memo (len 11): "fb_07ce1448"',
            'Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr consumed 19107 of 999850 compute units',
            'Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr success',
            'Program 11111111111111111111111111111111 invoke [1]',
            'Program 11111111111111111111111111111111 success',
            'Program Stake11111111111111111111111111111111111111 invoke [1]',
            'Program Stake11111111111111111111111111111111111111 success',
            'Program Stake11111111111111111111111111111111111111 invoke [1]',
            'Program Stake11111111111111111111111111111111111111 success',
        ],
        postBalances: [
            969985000, 30000000, 6258473240, 100000000, 42706560, 1009200, 51241152368, 1169280, 114979200, 960480, 1,
            521498880, 1,
        ],
        postTokenBalances: [],
        preBalances: [
            1000000000, 0, 6258473240, 100000000, 42706560, 1009200, 51241152368, 1169280, 114979200, 960480, 1,
            521498880, 1,
        ],
        preTokenBalances: [],
        rewards: [],
        status: {
            Ok: null,
        },
    },
    slot: 257314644,
    transaction: {
        message: {
            accountKeys: [
                {
                    pubkey: 'BfdPksUrBeWBQp8ati1uoFqavi59dbmVJ7BEB3e6NeAg',
                    signer: true,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'DdNzYKnkq7PqCRX4kncvwVYNZE7dZ9xdCz6yMekqjWH4',
                    signer: true,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'gHMcHv21qqgui64sPRC2RTTehck1yc2EPxP1xJNfejZ',
                    signer: true,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: '8XQj6xNHGrjfcL7K1a2KZMHjG2M9d6HCTxTL2wVjFjBa',
                    signer: false,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'SysvarRecentB1ockHashes11111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'SysvarRent111111111111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'FwR3PbjS5iyqzLiLugrBqKSa5EKZ4vK9SKs7eQXtT59f',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'SysvarC1ock11111111111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'SysvarStakeHistory1111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'StakeConfig11111111111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: '11111111111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
                {
                    pubkey: 'Stake11111111111111111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
            ],
            instructions: [
                {
                    parsed: {
                        info: {
                            nonceAccount: '8XQj6xNHGrjfcL7K1a2KZMHjG2M9d6HCTxTL2wVjFjBa',
                            nonceAuthority: 'gHMcHv21qqgui64sPRC2RTTehck1yc2EPxP1xJNfejZ',
                            recentBlockhashesSysvar: 'SysvarRecentB1ockHashes11111111111111111111',
                        },
                        type: 'advanceNonce',
                    },
                    program: 'system',
                    programId: '11111111111111111111111111111111',
                    stackHeight: null,
                },
                {
                    parsed: 'fb_07ce1448',
                    program: 'spl-memo',
                    programId: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
                    stackHeight: null,
                },
                {
                    parsed: {
                        info: {
                            lamports: 30000000,
                            newAccount: 'DdNzYKnkq7PqCRX4kncvwVYNZE7dZ9xdCz6yMekqjWH4',
                            owner: 'Stake11111111111111111111111111111111111111',
                            source: 'BfdPksUrBeWBQp8ati1uoFqavi59dbmVJ7BEB3e6NeAg',
                            space: 200,
                        },
                        type: 'createAccount',
                    },
                    program: 'system',
                    programId: '11111111111111111111111111111111',
                    stackHeight: null,
                },
                {
                    parsed: {
                        info: {
                            authorized: {
                                staker: 'BfdPksUrBeWBQp8ati1uoFqavi59dbmVJ7BEB3e6NeAg',
                                withdrawer: 'BfdPksUrBeWBQp8ati1uoFqavi59dbmVJ7BEB3e6NeAg',
                            },
                            lockup: {
                                custodian: '11111111111111111111111111111111',
                                epoch: 0,
                                unixTimestamp: 0,
                            },
                            rentSysvar: 'SysvarRent111111111111111111111111111111111',
                            stakeAccount: 'DdNzYKnkq7PqCRX4kncvwVYNZE7dZ9xdCz6yMekqjWH4',
                        },
                        type: 'initialize',
                    },
                    program: 'stake',
                    programId: 'Stake11111111111111111111111111111111111111',
                    stackHeight: null,
                },
                {
                    parsed: {
                        info: {
                            clockSysvar: 'SysvarC1ock11111111111111111111111111111111',
                            stakeAccount: 'DdNzYKnkq7PqCRX4kncvwVYNZE7dZ9xdCz6yMekqjWH4',
                            stakeAuthority: 'BfdPksUrBeWBQp8ati1uoFqavi59dbmVJ7BEB3e6NeAg',
                            stakeConfigAccount: 'StakeConfig11111111111111111111111111111111',
                            stakeHistorySysvar: 'SysvarStakeHistory1111111111111111111111111',
                            voteAccount: 'FwR3PbjS5iyqzLiLugrBqKSa5EKZ4vK9SKs7eQXtT59f',
                        },
                        type: 'delegate',
                    },
                    program: 'stake',
                    programId: 'Stake11111111111111111111111111111111111111',
                    stackHeight: null,
                },
            ],
            recentBlockhash: 'CjfMoKRUSyDvhanrBauxrwTgjoPWUy5yvTsGbttseANT',
        },
        signatures: [
            '3zAhEb6t4UX8cJfrTujTGwdXW6KzMJZ5zQzZEBvJsmznQCPmb1DCyfGMzDvHt8nvATMjBhNCQhenxxdv3kvKcxNE',
            '3zAhEb6t4UX8cJfrTujTGwdXW6KzMJZ5zQzZEBvJsmznbCTczzN4keMoEWEZXRNZvH4Kj2neWetV47sZShPSXfn4',
            '3sHi1r5cKLYgojXRBssDNG9vd5cGraUMwehUDiBVm2SLMUcY5NwCaXG9u3PYZ6VY1R4kNfCKHU2m1RLnDPnAURFT',
        ],
    },
};

// There's a memo instruction in this one
export const mockTransactionMemo = mockTransactionStake;

export const mockTransactionVote = {
    blockTime: 1699617237,
    meta: {
        computeUnitsConsumed: 2100,
        err: null,
        fee: 10000,
        innerInstructions: [],
        logMessages: [
            'Program Vote111111111111111111111111111111111111111 invoke [1]',
            'Program Vote111111111111111111111111111111111111111 success',
        ],
        postBalances: [500400400000, 1000000000000000, 1],
        postTokenBalances: [],
        preBalances: [500400410000, 1000000000000000, 1],
        preTokenBalances: [],
        rewards: [],
        status: {
            Ok: null,
        },
    },
    slot: 20210,
    transaction: {
        message: {
            accountKeys: [
                {
                    pubkey: '2gZDNztVterZb7aSMifCRd4V15YY8a9QcBBQ3ARTDe95',
                    signer: true,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'GGLDv8wTrSNuEq1pBhUfDFYEKFXDsvFU7YHkMj7a1EyK',
                    signer: true,
                    source: 'transaction',
                    writable: true,
                },
                {
                    pubkey: 'Vote111111111111111111111111111111111111111',
                    signer: false,
                    source: 'transaction',
                    writable: false,
                },
            ],
            instructions: [
                {
                    parsed: {
                        info: {
                            voteAccount: 'GGLDv8wTrSNuEq1pBhUfDFYEKFXDsvFU7YHkMj7a1EyK',
                            voteAuthority: 'GGLDv8wTrSNuEq1pBhUfDFYEKFXDsvFU7YHkMj7a1EyK',
                            voteStateUpdate: {
                                hash: '72apBZbPCAZGwxhfmGNr23r2UmEScmj1VpKkyKpLRFJU',
                                lockouts: [
                                    {
                                        confirmation_count: 31,
                                        slot: 20179,
                                    },
                                    {
                                        confirmation_count: 30,
                                        slot: 20180,
                                    },
                                    {
                                        confirmation_count: 29,
                                        slot: 20181,
                                    },
                                    {
                                        confirmation_count: 28,
                                        slot: 20182,
                                    },
                                    {
                                        confirmation_count: 27,
                                        slot: 20183,
                                    },
                                    {
                                        confirmation_count: 26,
                                        slot: 20184,
                                    },
                                    {
                                        confirmation_count: 25,
                                        slot: 20185,
                                    },
                                    {
                                        confirmation_count: 24,
                                        slot: 20186,
                                    },
                                    {
                                        confirmation_count: 23,
                                        slot: 20187,
                                    },
                                    {
                                        confirmation_count: 22,
                                        slot: 20188,
                                    },
                                    {
                                        confirmation_count: 21,
                                        slot: 20189,
                                    },
                                    {
                                        confirmation_count: 20,
                                        slot: 20190,
                                    },
                                    {
                                        confirmation_count: 19,
                                        slot: 20191,
                                    },
                                    {
                                        confirmation_count: 18,
                                        slot: 20192,
                                    },
                                    {
                                        confirmation_count: 17,
                                        slot: 20193,
                                    },
                                    {
                                        confirmation_count: 16,
                                        slot: 20194,
                                    },
                                    {
                                        confirmation_count: 15,
                                        slot: 20195,
                                    },
                                    {
                                        confirmation_count: 14,
                                        slot: 20196,
                                    },
                                    {
                                        confirmation_count: 13,
                                        slot: 20197,
                                    },
                                    {
                                        confirmation_count: 12,
                                        slot: 20198,
                                    },
                                    {
                                        confirmation_count: 11,
                                        slot: 20199,
                                    },
                                    {
                                        confirmation_count: 10,
                                        slot: 20200,
                                    },
                                    {
                                        confirmation_count: 9,
                                        slot: 20201,
                                    },
                                    {
                                        confirmation_count: 8,
                                        slot: 20202,
                                    },
                                    {
                                        confirmation_count: 7,
                                        slot: 20203,
                                    },
                                    {
                                        confirmation_count: 6,
                                        slot: 20204,
                                    },
                                    {
                                        confirmation_count: 5,
                                        slot: 20205,
                                    },
                                    {
                                        confirmation_count: 4,
                                        slot: 20206,
                                    },
                                    {
                                        confirmation_count: 3,
                                        slot: 20207,
                                    },
                                    {
                                        confirmation_count: 2,
                                        slot: 20208,
                                    },
                                    {
                                        confirmation_count: 1,
                                        slot: 20209,
                                    },
                                ],
                                root: 20178,
                                timestamp: 1699617238,
                            },
                        },
                        type: 'compactupdatevotestate',
                    },
                    program: 'vote',
                    programId: 'Vote111111111111111111111111111111111111111',
                    stackHeight: null,
                },
            ],
            recentBlockhash: 'EBSvSuA2grMDdbBB61KSxmW8V7dauiXLJouyXGLiiEYz',
        },
        signatures: [
            '41TfwbZi3WV5NJ7BY42r9sSkCUNfA7ab3j744DXR2wxZG9FyfctAoMYVYpQDj4je3xo89W7cvqGMzAq1nxd8R4xx',
            '2FaeinN3wGnytjrEZkP1KULaF24jrTHbD52TYowyErEfuhvavwRcLensJyiRicqEPKEaiBCzxn1BpR5Yi8BCYrhK',
        ],
    },
};

const mockRewards = [
    {
        commission: 0.1,
        lamports: 50000,
        postBalance: 1000000000000000,
        pubkey: 'DdNzYKnkq7PqCRX4kncvwVYNZE7dZ9xdCz6yMekqjWH4',
        rewardType: 'stake',
    },
    {
        commission: 0.1,
        lamports: 50000,
        postBalance: 1000000000000000,
        pubkey: 'DdNzYKnkq7PqCRX4kncvwVYNZE7dZ9xdCz6yMekqjWH4',
        rewardType: 'stake',
    },
    {
        commission: 0.1,
        lamports: 50000,
        postBalance: 1000000000000000,
        pubkey: 'DdNzYKnkq7PqCRX4kncvwVYNZE7dZ9xdCz6yMekqjWH4',
        rewardType: 'stake',
    },
];

export const mockBlockFullBase58 = {
    blockHeight: 257317189,
    blockTime: 1699618066,
    blockhash: 'bFotro8geZ9HJbE3SUJ77yQuCaECpRidocDapgM2BNW',
    parentSlot: 257317188,
    previousBlockhash: '3Z3gk6nNq8qRq6JnV8o9Xh7s7P8Q4qY4v9dZ5XnJzGtM',
    rewards: mockRewards,
    transactions: [mockTransactionBase58, mockTransactionBase58],
};

export const mockBlockFullBase64 = {
    blockHeight: 257317189,
    blockTime: 1699618066,
    blockhash: 'bFotro8geZ9HJbE3SUJ77yQuCaECpRidocDapgM2BNW',
    parentSlot: 257317188,
    previousBlockhash: '3Z3gk6nNq8qRq6JnV8o9Xh7s7P8Q4qY4v9dZ5XnJzGtM',
    rewards: mockRewards,
    transactions: [mockTransactionBase64, mockTransactionBase64],
};

export const mockBlockFull = {
    blockHeight: 257317189,
    blockTime: 1699618066,
    blockhash: 'bFotro8geZ9HJbE3SUJ77yQuCaECpRidocDapgM2BNW',
    parentSlot: 257317188,
    previousBlockhash: '3Z3gk6nNq8qRq6JnV8o9Xh7s7P8Q4qY4v9dZ5XnJzGtM',
    rewards: mockRewards,
    transactions: [
        mockTransactionAddressLookup,
        mockTransactionGeneric,
        mockTransactionStake,
        mockTransactionSystem,
        mockTransactionToken,
        mockTransactionVote,
    ],
};

export const mockBlockSignatures = {
    blockHeight: 257317189,
    blockTime: 1699618066,
    blockhash: 'bFotro8geZ9HJbE3SUJ77yQuCaECpRidocDapgM2BNW',
    parentSlot: 257317188,
    previousBlockhash: '3Z3gk6nNq8qRq6JnV8o9Xh7s7P8Q4qY4v9dZ5XnJzGtM',
    rewards: mockRewards,
    signatures: [
        '3mjQHJqKBrWe2LnUYsx3a7Vr68qQHCW1ru2m2ycuiFfcihcpXdQ7KqKrjqKyQkmN5jjcvMeBvJDsSTiaXzoSWXSF',
        '2Tfh6G4R9cxdtFDbCvnNR9QKjJX8o19ux4WwYiZsx9xRcAKKmZg88BqgQRJf2mrZBj1PuTPVCspWTDqqaNZAdsPJ',
    ],
};
