import { Buffer } from 'node:buffer';

import { fixEncoder } from '@solana/codecs-core';
import { getBase58Decoder, getBase58Encoder } from '@solana/codecs-strings';
import { createPrivateKeyFromBytes } from '@solana/keys';
import type { Rpc } from '@solana/rpc-spec';
import { RpcError } from '@solana/rpc-spec-types';
import type { Commitment, SolanaRpcErrorCode } from '@solana/rpc-types';
import type { Base64EncodedWireTransaction } from '@solana/transactions';

import { GetLatestBlockhashApi, SendTransactionApi } from '../index';
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
    const blockhashBytes = fixEncoder(getBase58Encoder(), 32).encode(blockhash);
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

async function getSecretKey() {
    return await createPrivateKeyFromBytes(MOCK_PRIVATE_KEY_BYTES, /* extractable */ false);
}

describe('sendTransaction', () => {
    let rpc: Rpc<GetLatestBlockhashApi & SendTransactionApi>;
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
        expect.assertions(3);
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
        await expect(resultPromise).rejects.toThrow(RpcError);
        await expect(resultPromise).rejects.toThrow(/Transaction signature verification failure/);
        await expect(resultPromise).rejects.toMatchObject({
            code: -32003 satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_SERVER_ERROR_TRANSACTION_SIGNATURE_VERIFICATION_FAILURE'],
        });
    });
    it('fatals when called with a transaction having an unsupported version', async () => {
        expect.assertions(3);
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
        await expect(resultPromise).rejects.toThrow(RpcError);
        await expect(resultPromise).rejects.toThrow(
            /invalid value: integer `126`, expected a valid transaction message version/,
        );
        await expect(resultPromise).rejects.toMatchObject({
            code: -32602 satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
        });
    });
    it('fatals when called with a malformed transaction message', async () => {
        expect.assertions(3);
        const secretKey = await getSecretKey();
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
        await expect(resultPromise).rejects.toThrow(RpcError);
        await expect(resultPromise).rejects.toThrow(/failed to fill whole buffer/);
        await expect(resultPromise).rejects.toMatchObject({
            code: -32602 satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
        });
    });
    it('fatals when the fee payer has insufficient funds', async () => {
        expect.assertions(3);
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
        await expect(resultPromise).rejects.toThrow(RpcError);
        await expect(resultPromise).rejects.toThrow(
            /Attempt to debit an account but found no record of a prior credit/,
        );
        await expect(resultPromise).rejects.toMatchObject({
            code: -32002 satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE'],
        });
    });
    it('fatals when the blockhash does not exist', async () => {
        expect.assertions(3);
        const secretKey = await getSecretKey();
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
        await expect(resultPromise).rejects.toThrow(RpcError);
        await expect(resultPromise).rejects.toThrow(/Blockhash not found/);
        await expect(resultPromise).rejects.toMatchObject({
            code: -32002 satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE'],
        });
    });
    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(2);
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
            await expect(resultPromise).rejects.toThrow(RpcError);
            await expect(resultPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
            });
        });
    });
});
