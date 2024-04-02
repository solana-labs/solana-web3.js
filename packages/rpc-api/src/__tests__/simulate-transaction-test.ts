import { Buffer } from 'node:buffer';

import type { Address } from '@solana/addresses';
import { fixEncoderSize, ReadonlyUint8Array } from '@solana/codecs-core';
import { getBase58Decoder, getBase58Encoder } from '@solana/codecs-strings';
import {
    SOLANA_ERROR__JSON_RPC__INVALID_PARAMS,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_SIGNATURE_VERIFICATION_FAILURE,
    SolanaError,
} from '@solana/errors';
import { createPrivateKeyFromBytes } from '@solana/keys';
import type { Rpc } from '@solana/rpc-spec';
import type { Base58EncodedBytes, Commitment } from '@solana/rpc-types';
import type { Base64EncodedWireTransaction } from '@solana/transactions';

import { GetLatestBlockhashApi, SimulateTransactionApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

function getMockTransactionMessage({
    blockhash,
    feePayerAddressBytes,
    memoString,
    version = 0x80, // 0 + version mask
}: {
    blockhash: string;
    feePayerAddressBytes: Uint8Array;
    memoString: string;
    version?: number;
}) {
    const blockhashBytes = fixEncoderSize(getBase58Encoder(), 32).encode(blockhash);
    // prettier-ignore
    return new Uint8Array([
        /** VERSION HEADER */
        version,

        /** MESSAGE HEADER */
        0x01, // numSignerAccounts
        0x00, // numReadonlySignerAccount
        0x01, // numReadonlyNonSignerAccounts

        /** STATIC ADDRESSES */
        0x02, // Number of static accounts
        ...feePayerAddressBytes,
        0x05, 0x4a, 0x53, 0x5a, 0x99, 0x29, 0x21, 0x06, 0x4d, 0x24, 0xe8, 0x71, 0x60, 0xda, 0x38, 0x7c, 0x7c, 0x35, 0xb5, 0xdd, 0xbc, 0x92, 0xbb, 0x81, 0xe4, 0x1f, 0xa8, 0x40, 0x41, 0x05, 0x44, 0x8d, // MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr

        /** TRANSACTION LIFETIME TOKEN (ie. the blockhash) */
        ...blockhashBytes,

        /* INSTRUCTIONS */
        0x01, // Number of instructions

        // First instruction
        0x01, // Program address index
        0x00, // Number of address indices
        memoString.length, // Length of instruction data
        ...new TextEncoder().encode(memoString),

        /** ADDRESS TABLE LOOKUPS */
        0x00, // Number of address table lookups
    ]);
}

function getMockTransactionMessageWithAdditionalAccount({
    blockhash,
    feePayerAddressBytes,
    accountAddressBytes,
    memoString,
    version = 0x80, // 0 + version mask
}: {
    accountAddressBytes: ReadonlyUint8Array;
    blockhash: string;
    feePayerAddressBytes: ReadonlyUint8Array;
    memoString: string;
    version?: number;
}) {
    const blockhashBytes = fixEncoderSize(getBase58Encoder(), 32).encode(blockhash);
    // prettier-ignore
    return new Uint8Array([
        /** VERSION HEADER */
        version,

        /** MESSAGE HEADER */
        0x01, // numSignerAccounts
        0x00, // numReadonlySignerAccount
        0x01, // numReadonlyNonSignerAccounts

        /** STATIC ADDRESSES */
        0x03, // Number of static accounts
        ...feePayerAddressBytes,
        0x05, 0x4a, 0x53, 0x5a, 0x99, 0x29, 0x21, 0x06, 0x4d, 0x24, 0xe8, 0x71, 0x60, 0xda, 0x38, 0x7c, 0x7c, 0x35, 0xb5, 0xdd, 0xbc, 0x92, 0xbb, 0x81, 0xe4, 0x1f, 0xa8, 0x40, 0x41, 0x05, 0x44, 0x8d, // MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
        ...accountAddressBytes,

        /** TRANSACTION LIFETIME TOKEN (ie. the blockhash) */
        ...blockhashBytes,

        /* INSTRUCTIONS */
        0x01, // Number of instructions

        // First instruction
        0x01, // Program address index
        0x00, // Number of address indices
        memoString.length, // Length of instruction data
        ...new TextEncoder().encode(memoString),

        /** ADDRESS TABLE LOOKUPS */
        0x00, // Number of address table lookups
    ]);
}

const MOCK_PRIVATE_KEY_BYTES = new Uint8Array([
    16, 192, 67, 187, 170, 210, 152, 95, 180, 204, 123, 21, 81, 45, 171, 85, 188, 91, 164, 34, 8, 0, 244, 56, 209, 190,
    255, 201, 212, 94, 45, 186,
]);
// See scripts/fixtures/send-transaction-fee-payer.json
const MOCK_PUBLIC_KEY_BYTES = // DRtXHDgC312wpNdNCSb8vCoXDcofCJcPHdAw4VkJ8L9i
    // prettier-ignore
    new Uint8Array([
        0xb8, 0xac, 0x70, 0x4f, 0xaf, 0xc7, 0xa5, 0xfc, 0x8c, 0x5d, 0x1f, 0x0a, 0xc8, 0xcf, 0xaa, 0xe0,
        0x42, 0xfa, 0x3b, 0xb8, 0x25, 0xf0, 0xec, 0xfc, 0xe2, 0x27, 0x4d, 0x7d, 0xad, 0xad, 0x51, 0x2d,
    ]);

async function getSecretKey() {
    return await createPrivateKeyFromBytes(MOCK_PRIVATE_KEY_BYTES, /* extractable */ false);
}

describe('simulateTransaction', () => {
    let rpc: Rpc<GetLatestBlockhashApi & SimulateTransactionApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` preflight commitment`, () => {
            if (commitment === 'finalized') {
                it.todo(
                    'returns the transaction information (test broken; see https://discord.com/channels/428295358100013066/560496939779620864/1132048104728825926)',
                );
                return;
            }
            it('returns the transaction information', async () => {
                expect.assertions(1);
                const [secretKey, { value: latestBlockhash }] = await Promise.all([
                    getSecretKey(),
                    rpc.getLatestBlockhash({ commitment }).send(),
                ]);
                const message = getMockTransactionMessage({
                    blockhash: latestBlockhash.blockhash,
                    feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
                    memoString: `Hello from the web3.js tests! [${performance.now()}]`,
                });
                const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
                const resultPromise = rpc
                    .simulateTransaction(
                        Buffer.from(
                            new Uint8Array([
                                0x01, // Length of signatures
                                ...signature,
                                ...message,
                            ]),
                        ).toString('base64') as Base64EncodedWireTransaction,
                        { commitment, encoding: 'base64' },
                    )
                    .send();

                await expect(resultPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
                        accounts: null,
                        err: null,
                        logs: expect.any(Array),
                        returnData: null,
                        unitsConsumed: expect.any(BigInt),
                    },
                });
            });
        });
    });

    it('throws when called with a `minContextSlot` higher than the highest slot available', async () => {
        expect.assertions(3);
        const [secretKey, { value: latestBlockhash }] = await Promise.all([
            getSecretKey(),
            rpc.getLatestBlockhash({ commitment: 'processed' }).send(),
        ]);
        const message = getMockTransactionMessage({
            blockhash: latestBlockhash.blockhash,
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .simulateTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                {
                    commitment: 'processed',
                    encoding: 'base64',
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                },
            )
            .send();
        await Promise.all([
            expect(resultPromise).rejects.toThrow(SolanaError),
            expect(resultPromise).rejects.toHaveProperty(
                'context.__code',
                SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED,
            ),
            expect(resultPromise).rejects.toHaveProperty('context.contextSlot', expect.any(Number)),
        ]);
    });

    it('throws when called with an invalid signature if `sigVerify` is true', async () => {
        expect.assertions(1);
        const { value: latestBlockhash } = await rpc.getLatestBlockhash({ commitment: 'processed' }).send();
        const message = getMockTransactionMessage({
            blockhash: latestBlockhash.blockhash,
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(Array(64).fill(0));
        const resultPromise = rpc
            .simulateTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                {
                    commitment: 'processed',
                    encoding: 'base64',
                    sigVerify: true,
                },
            )
            .send();

        await expect(resultPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_SIGNATURE_VERIFICATION_FAILURE),
        );
    });

    it('does not throw when called with an invalid signature when `sigVerify` is false', async () => {
        expect.assertions(1);
        const { value: latestBlockhash } = await rpc.getLatestBlockhash({ commitment: 'processed' }).send();
        const message = getMockTransactionMessage({
            blockhash: latestBlockhash.blockhash,
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(Array(64).fill(0));
        const resultPromise = rpc
            .simulateTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                {
                    commitment: 'processed',
                    encoding: 'base64',
                    sigVerify: false,
                },
            )
            .send();

        await expect(resultPromise).resolves.toStrictEqual({
            context: CONTEXT_MATCHER,
            value: {
                accounts: null,
                err: null,
                logs: expect.any(Array),
                returnData: null,
                unitsConsumed: expect.any(BigInt),
            },
        });
    });

    it('returns a BlockhashNotFound error when the blockhash does not exist when `replaceRecentBlockhash` is false', async () => {
        expect.assertions(1);
        const secretKey = await getSecretKey();
        const message = getMockTransactionMessage({
            blockhash: getBase58Decoder().decode(new Uint8Array(Array(32).fill(0))),
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .simulateTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                {
                    commitment: 'processed',
                    encoding: 'base64',
                    replaceRecentBlockhash: false,
                },
            )
            .send();

        await expect(resultPromise).resolves.toStrictEqual({
            context: CONTEXT_MATCHER,
            value: {
                accounts: null,
                err: 'BlockhashNotFound',
                logs: expect.any(Array),
                returnData: null,
                unitsConsumed: expect.any(BigInt),
            },
        });
    });

    it('replaces the invalid blockhash when `replaceRecentBlockhash` is true', async () => {
        expect.assertions(1);
        const secretKey = await getSecretKey();
        const message = getMockTransactionMessage({
            blockhash: getBase58Decoder().decode(new Uint8Array(Array(32).fill(0))),
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .simulateTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                {
                    commitment: 'processed',
                    encoding: 'base64',
                    replaceRecentBlockhash: true,
                },
            )
            .send();

        await expect(resultPromise).resolves.toStrictEqual({
            context: CONTEXT_MATCHER,
            value: {
                accounts: null,
                err: null,
                logs: expect.any(Array),
                returnData: null,
                unitsConsumed: expect.any(BigInt),
            },
        });
    });

    it('throws when called with a transaction having an unsupported version', async () => {
        expect.assertions(1);
        const [secretKey, { value: latestBlockhash }] = await Promise.all([
            getSecretKey(),
            rpc.getLatestBlockhash({ commitment: 'processed' }).send(),
        ]);
        const message = getMockTransactionMessage({
            blockhash: latestBlockhash.blockhash,
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
            version: 0xfe, // Version 126
        });
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .simulateTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                { commitment: 'processed', encoding: 'base64' },
            )
            .send();
        await expect(resultPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__JSON_RPC__INVALID_PARAMS, {
                __serverMessage:
                    'failed to deserialize solana_sdk::transaction::versioned::' +
                    'VersionedTransaction: invalid value: integer `126`, expected a valid ' +
                    'transaction message version',
            }),
        );
    });

    it('throws when called with a malformed transaction message', async () => {
        expect.assertions(1);
        const secretKey = await getSecretKey();
        const message = new Uint8Array([4, 5, 6]);
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .simulateTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                { commitment: 'processed', encoding: 'base64' },
            )
            .send();
        await expect(resultPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__JSON_RPC__INVALID_PARAMS, {
                __serverMessage:
                    'failed to deserialize solana_sdk::transaction::versioned::' +
                    'VersionedTransaction: io error: failed to fill whole buffer',
            }),
        );
    });

    it('returns an AccountNotFound error when the fee payer is an unknown account', async () => {
        expect.assertions(1);
        const [[secretKey, publicKeyBytes], { value: latestBlockhash }] = await Promise.all([
            (async () => {
                const keyPair = (await crypto.subtle.generateKey('Ed25519', /* extractable */ false, [
                    'sign',
                    'verify',
                ])) as CryptoKeyPair;
                return [keyPair.privateKey, new Uint8Array(await crypto.subtle.exportKey('raw', keyPair.publicKey))];
            })(),
            rpc.getLatestBlockhash({ commitment: 'processed' }).send(),
        ]);
        const message = getMockTransactionMessage({
            blockhash: latestBlockhash.blockhash,
            feePayerAddressBytes: publicKeyBytes,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .simulateTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                { commitment: 'processed', encoding: 'base64' },
            )
            .send();

        await expect(resultPromise).resolves.toStrictEqual({
            context: CONTEXT_MATCHER,
            value: {
                accounts: null,
                err: 'AccountNotFound',
                logs: expect.any(Array),
                returnData: null,
                unitsConsumed: expect.any(BigInt),
            },
        });
    });

    it('returns account data for a transaction account with base64 encoding', async () => {
        expect.assertions(1);
        const [secretKey, { value: latestBlockhash }] = await Promise.all([
            getSecretKey(),
            rpc.getLatestBlockhash({ commitment: 'processed' }).send(),
        ]);
        const message = getMockTransactionMessage({
            blockhash: latestBlockhash.blockhash,
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .simulateTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                {
                    accounts: {
                        addresses: ['DRtXHDgC312wpNdNCSb8vCoXDcofCJcPHdAw4VkJ8L9i' as Address],
                        encoding: 'base64',
                    },
                    commitment: 'processed',
                    encoding: 'base64',
                },
            )
            .send();

        await expect(resultPromise).resolves.toStrictEqual({
            context: CONTEXT_MATCHER,
            value: {
                accounts: [
                    expect.objectContaining({
                        data: ['', 'base64'],
                    }),
                ],
                err: null,
                logs: expect.any(Array),
                returnData: null,
                unitsConsumed: expect.any(BigInt),
            },
        });
    });

    it('returns account data for a transaction account with base64+zstd encoding', async () => {
        expect.assertions(1);
        const [secretKey, { value: latestBlockhash }] = await Promise.all([
            getSecretKey(),
            rpc.getLatestBlockhash({ commitment: 'processed' }).send(),
        ]);
        const message = getMockTransactionMessage({
            blockhash: latestBlockhash.blockhash,
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .simulateTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                {
                    accounts: {
                        addresses: ['DRtXHDgC312wpNdNCSb8vCoXDcofCJcPHdAw4VkJ8L9i' as Address],
                        encoding: 'base64+zstd',
                    },
                    commitment: 'processed',
                    encoding: 'base64',
                },
            )
            .send();

        await expect(resultPromise).resolves.toStrictEqual({
            context: CONTEXT_MATCHER,
            value: {
                accounts: [
                    expect.objectContaining({
                        data: [expect.any(String), 'base64+zstd'],
                    }),
                ],
                err: null,
                logs: expect.any(Array),
                returnData: null,
                unitsConsumed: expect.any(BigInt),
            },
        });
    });

    it('returns account data for a transaction account with jsonParsed encoding', async () => {
        expect.assertions(1);
        const [secretKey, { value: latestBlockhash }] = await Promise.all([
            getSecretKey(),
            rpc.getLatestBlockhash({ commitment: 'processed' }).send(),
        ]);
        const message = getMockTransactionMessageWithAdditionalAccount({
            accountAddressBytes: getBase58Encoder().encode('4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp'), // see scripts/fixtures/vote-account.json
            blockhash: latestBlockhash.blockhash,
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .simulateTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                {
                    accounts: {
                        addresses: ['4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp' as Address],
                        encoding: 'jsonParsed',
                    },
                    commitment: 'processed',
                    encoding: 'base64',
                },
            )
            .send();

        await expect(resultPromise).resolves.toStrictEqual({
            context: CONTEXT_MATCHER,
            value: {
                accounts: [
                    expect.objectContaining({
                        data: expect.objectContaining({
                            parsed: expect.objectContaining({
                                info: {
                                    authorizedVoters: expect.any(Array),
                                    authorizedWithdrawer: expect.any(String),
                                    commission: expect.any(Number),
                                    epochCredits: expect.any(Array),
                                    lastTimestamp: expect.any(Object),
                                    nodePubkey: expect.any(String),
                                    priorVoters: expect.any(Array),
                                    rootSlot: expect.any(BigInt),
                                    votes: expect.any(Array),
                                },
                                type: 'vote',
                            }),
                            program: 'vote',
                        }),
                    }),
                ],
                err: null,
                logs: expect.any(Array),
                returnData: null,
                unitsConsumed: expect.any(BigInt),
            },
        });
    });

    it('returns account data for a transaction account with jsonParsed encoding (fallback to base64)', async () => {
        expect.assertions(1);
        const [secretKey, { value: latestBlockhash }] = await Promise.all([
            getSecretKey(),
            rpc.getLatestBlockhash({ commitment: 'processed' }).send(),
        ]);
        const message = getMockTransactionMessage({
            blockhash: latestBlockhash.blockhash,
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .simulateTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                {
                    accounts: {
                        addresses: ['DRtXHDgC312wpNdNCSb8vCoXDcofCJcPHdAw4VkJ8L9i' as Address],
                        encoding: 'jsonParsed',
                    },
                    commitment: 'processed',
                    encoding: 'base64',
                },
            )
            .send();

        await expect(resultPromise).resolves.toStrictEqual({
            context: CONTEXT_MATCHER,
            value: {
                accounts: [
                    expect.objectContaining({
                        // falls back to base64
                        data: ['', 'base64'],
                    }),
                ],
                err: null,
                logs: expect.any(Array),
                returnData: null,
                unitsConsumed: expect.any(BigInt),
            },
        });
    });

    it('returns account data for a transaction account with base64 encoding when encoding is not specified', async () => {
        expect.assertions(1);
        const [secretKey, { value: latestBlockhash }] = await Promise.all([
            getSecretKey(),
            rpc.getLatestBlockhash({ commitment: 'processed' }).send(),
        ]);
        const message = getMockTransactionMessage({
            blockhash: latestBlockhash.blockhash,
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .simulateTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                {
                    accounts: {
                        addresses: ['DRtXHDgC312wpNdNCSb8vCoXDcofCJcPHdAw4VkJ8L9i' as Address],
                    },
                    commitment: 'processed',
                    encoding: 'base64',
                },
            )
            .send();

        await expect(resultPromise).resolves.toStrictEqual({
            context: CONTEXT_MATCHER,
            value: {
                accounts: [
                    expect.objectContaining({
                        data: ['', 'base64'],
                    }),
                ],
                err: null,
                logs: expect.any(Array),
                returnData: null,
                unitsConsumed: expect.any(BigInt),
            },
        });
    });

    it('returns null array entries for accounts that are not part of the transaction', async () => {
        expect.assertions(1);
        const [secretKey, { value: latestBlockhash }] = await Promise.all([
            getSecretKey(),
            rpc.getLatestBlockhash({ commitment: 'processed' }).send(),
        ]);
        const message = getMockTransactionMessage({
            blockhash: latestBlockhash.blockhash,
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .simulateTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                {
                    accounts: {
                        addresses: [
                            // Randomly generated
                            'CsJGwBvZrmMheK7cgMXh7ZHmKLL5w76X7pmofUG3cUWB' as Address,
                            'DRtXHDgC312wpNdNCSb8vCoXDcofCJcPHdAw4VkJ8L9i' as Address,
                        ],
                        encoding: 'base64',
                    },
                    commitment: 'processed',
                    encoding: 'base64',
                },
            )
            .send();

        await expect(resultPromise).resolves.toStrictEqual({
            context: CONTEXT_MATCHER,
            value: {
                accounts: [
                    null,
                    expect.objectContaining({
                        data: ['', 'base64'],
                    }),
                ],
                err: null,
                logs: expect.any(Array),
                returnData: null,
                unitsConsumed: expect.any(BigInt),
            },
        });
    });

    it('returns transaction information for a base58 encoded transaction', async () => {
        expect.assertions(1);
        const [secretKey, { value: latestBlockhash }] = await Promise.all([
            getSecretKey(),
            rpc.getLatestBlockhash({ commitment: 'processed' }).send(),
        ]);
        const message = getMockTransactionMessage({
            blockhash: latestBlockhash.blockhash,
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const base58WireTransaction = getBase58Decoder().decode(
            Buffer.from(
                new Uint8Array([
                    0x01, // Length of signatures
                    ...signature,
                    ...message,
                ]),
            ),
        );
        const resultPromise = rpc
            .simulateTransaction(base58WireTransaction as Base58EncodedBytes, {
                commitment: 'processed',
            })
            .send();

        await expect(resultPromise).resolves.toStrictEqual({
            context: CONTEXT_MATCHER,
            value: {
                accounts: null,
                err: null,
                logs: expect.any(Array),
                returnData: null,
                unitsConsumed: expect.any(BigInt),
            },
        });
    });
});
