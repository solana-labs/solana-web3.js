import { Buffer } from 'node:buffer';

import { fixEncoderSize } from '@solana/codecs-core';
import { getBase58Decoder, getBase58Encoder } from '@solana/codecs-strings';
import {
    SOLANA_ERROR__JSON_RPC__INVALID_PARAMS,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_SIGNATURE_VERIFICATION_FAILURE,
    SOLANA_ERROR__TRANSACTION_ERROR__ACCOUNT_NOT_FOUND,
    SOLANA_ERROR__TRANSACTION_ERROR__BLOCKHASH_NOT_FOUND,
    SOLANA_ERROR__TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_FEE,
    SolanaError,
} from '@solana/errors';
import { createPrivateKeyFromBytes } from '@solana/keys';
import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';
import type { Base64EncodedWireTransaction } from '@solana/transactions';

import { GetLatestBlockhashApi, GetMinimumBalanceForRentExemptionApi, SendTransactionApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

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

const MOCK_INSUFFICIENT_BALANCE_PRIVATE_KEY_BYTES = new Uint8Array([
    153, 77, 119, 0, 167, 108, 113, 105, 100, 122, 229, 212, 244, 214, 192, 210, 79, 109, 245, 95, 24, 121, 235, 17, 55,
    166, 132, 117, 31, 134, 31, 171,
]);
// See scripts/fixtures/send-transaction-fee-payer-insuffcient-funds.json
const MOCK_INSUFFICIENT_BALANCE_PUBLIC_KEY_BYTES = // 6Zs91PMyhqyMgNVuT8EnM6f3YjVAVabvVWLjpFSC288q
    // prettier-ignore
    new Uint8Array([
        0x52, 0xb5, 0xb6, 0x37, 0xf1, 0x28, 0x73, 0x8d, 0x25, 0x61, 0x59, 0xba, 0xca, 0x2b, 0x99, 0x20,
        0x1c, 0xa8, 0xa6, 0xb3, 0xa1, 0x95, 0xfc, 0x07, 0x9d, 0xa2, 0xf1, 0xb7, 0x33, 0xc0, 0xa5, 0x3a,
    ]);

async function getSecretKey(privateKeyBytes: Uint8Array) {
    return await createPrivateKeyFromBytes(privateKeyBytes, /* extractable */ false);
}

describe('sendTransaction', () => {
    let rpc: Rpc<GetLatestBlockhashApi & GetMinimumBalanceForRentExemptionApi & SendTransactionApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` preflight commitment`, () => {
            if (commitment === 'finalized') {
                it.todo(
                    'returns the transaction signature (test broken; see https://discord.com/channels/428295358100013066/560496939779620864/1132048104728825926)',
                );
                return;
            }
            it('returns the transaction signature', async () => {
                expect.assertions(1);
                const [secretKey, { value: latestBlockhash }] = await Promise.all([
                    getSecretKey(MOCK_PRIVATE_KEY_BYTES),
                    rpc.getLatestBlockhash({ commitment: 'processed' }).send(),
                ]);
                const message = getMockTransactionMessage({
                    blockhash: latestBlockhash.blockhash,
                    feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
                    memoString: `Hello from the web3.js tests! [${performance.now()}]`,
                });
                const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
                const resultPromise = rpc
                    .sendTransaction(
                        Buffer.from(
                            new Uint8Array([
                                0x01, // Length of signatures
                                ...signature,
                                ...message,
                            ]),
                        ).toString('base64') as Base64EncodedWireTransaction,
                        { encoding: 'base64', preflightCommitment: commitment },
                    )
                    .send();
                await expect(resultPromise).resolves.toEqual(getBase58Decoder().decode(signature));
            });
        });
    });
    it('fatals when called with a transaction having an invalid signature', async () => {
        expect.assertions(1);
        const { value: latestBlockhash } = await rpc.getLatestBlockhash({ commitment: 'processed' }).send();
        const message = getMockTransactionMessage({
            blockhash: latestBlockhash.blockhash,
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(Array(64).fill(0));
        const resultPromise = rpc
            .sendTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                { encoding: 'base64', preflightCommitment: 'processed' },
            )
            .send();
        await expect(resultPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_SIGNATURE_VERIFICATION_FAILURE),
        );
    });
    it('fatals when called with a transaction having an unsupported version', async () => {
        expect.assertions(1);
        const [secretKey, { value: latestBlockhash }] = await Promise.all([
            getSecretKey(MOCK_PRIVATE_KEY_BYTES),
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
            .sendTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                { encoding: 'base64', preflightCommitment: 'processed' },
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
    it('fatals when called with a malformed transaction message', async () => {
        expect.assertions(1);
        const secretKey = await getSecretKey(MOCK_PRIVATE_KEY_BYTES);
        const message = new Uint8Array([4, 5, 6]);
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .sendTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                { encoding: 'base64', preflightCommitment: 'processed' },
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
    it("fatals when the fee payer's account does not exist", async () => {
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
            .sendTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                { encoding: 'base64', preflightCommitment: 'processed' },
            )
            .send();
        await expect(resultPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE, {
                accounts: null,
                cause: new SolanaError(SOLANA_ERROR__TRANSACTION_ERROR__ACCOUNT_NOT_FOUND),
                logs: [],
                returnData: null,
                unitsConsumed: 0,
            }),
        );
    });
    it('fatals when the fee payer has insufficient funds to pay rent', async () => {
        expect.assertions(1);
        const [secretKey, { value: latestBlockhash }] = await Promise.all([
            getSecretKey(MOCK_INSUFFICIENT_BALANCE_PRIVATE_KEY_BYTES),
            rpc.getLatestBlockhash({ commitment: 'processed' }).send(),
        ]);
        const message = getMockTransactionMessage({
            blockhash: latestBlockhash.blockhash,
            feePayerAddressBytes: MOCK_INSUFFICIENT_BALANCE_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .sendTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x1, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                { encoding: 'base64', preflightCommitment: 'processed' },
            )
            .send();
        await expect(resultPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE, {
                accounts: null,
                cause: new SolanaError(SOLANA_ERROR__TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_FEE),
                logs: [],
                returnData: null,
                unitsConsumed: 0,
            }),
        );
    });
    it('fatals when the blockhash does not exist', async () => {
        expect.assertions(1);
        const secretKey = await getSecretKey(MOCK_PRIVATE_KEY_BYTES);
        const message = getMockTransactionMessage({
            blockhash: getBase58Decoder().decode(new Uint8Array(Array(32).fill(0))),
            feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
            memoString: `Hello from the web3.js tests! [${performance.now()}]`,
        });
        const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
        const resultPromise = rpc
            .sendTransaction(
                Buffer.from(
                    new Uint8Array([
                        0x01, // Length of signatures
                        ...signature,
                        ...message,
                    ]),
                ).toString('base64') as Base64EncodedWireTransaction,
                { encoding: 'base64', preflightCommitment: 'processed' },
            )
            .send();
        await expect(resultPromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE, {
                accounts: null,
                cause: new SolanaError(SOLANA_ERROR__TRANSACTION_ERROR__BLOCKHASH_NOT_FOUND),
                logs: [],
                returnData: null,
                unitsConsumed: 0,
            }),
        );
    });
    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(3);
            const [secretKey, { value: latestBlockhash }] = await Promise.all([
                getSecretKey(MOCK_PRIVATE_KEY_BYTES),
                rpc.getLatestBlockhash({ commitment: 'processed' }).send(),
            ]);
            const message = getMockTransactionMessage({
                blockhash: latestBlockhash.blockhash,
                feePayerAddressBytes: MOCK_PUBLIC_KEY_BYTES,
                memoString: `Hello from the web3.js tests! [${performance.now()}]`,
            });
            const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', secretKey, message));
            const resultPromise = rpc
                .sendTransaction(
                    Buffer.from(
                        new Uint8Array([
                            0x01, // Length of signatures
                            ...signature,
                            ...message,
                        ]),
                    ).toString('base64') as Base64EncodedWireTransaction,
                    {
                        encoding: 'base64',
                        minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                        preflightCommitment: 'processed',
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
    });
});
