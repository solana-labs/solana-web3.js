import { fixEncoder } from '@solana/codecs-core';
import { getBase58Decoder, getBase58Encoder } from '@solana/codecs-strings';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { Commitment } from '@solana/rpc-types';
import { Base64EncodedWireTransaction } from '@solana/transactions';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

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
const MOCK_PKCS8_PRIVATE_KEY =
    // prettier-ignore
    new Uint8Array([
        /**
         * PKCS#8 header
         */
        0x30, // ASN.1 sequence tag
        0x2e, // Length of sequence (46 more bytes)

            0x02, // ASN.1 integer tag
            0x01, // Length of integer
                0x00, // Version number

            0x30, // ASN.1 sequence tag
            0x05, // Length of sequence
                0x06, // ASN.1 object identifier tag
                0x03, // Length of object identifier
                    // Edwards curve algorithms identifier https://oid-rep.orange-labs.fr/get/1.3.101.112
                        0x2b, // iso(1) / identified-organization(3) (The first node is multiplied by the decimal 40 and the result is added to the value of the second node)
                        0x65, // thawte(101)
                    // Ed25519 identifier
                        0x70, // id-Ed25519(112)

        /**
         * Private key payload
         */
        0x04, // ASN.1 octet string tag
        0x22, // String length (34 more bytes)

            // Private key bytes as octet string
            0x04, // ASN.1 octet string tag
            0x20, // String length (32 bytes)
                16, 192, 67, 187, 170, 210, 152, 95,
                180, 204, 123, 21, 81, 45, 171, 85,
                188, 91, 164, 34, 8, 0, 244, 56,
                209, 190, 255, 201, 212, 94, 45, 186,
    ]);
// See scripts/fixtures/send-transaction-fee-payer.json
const MOCK_PUBLIC_KEY_BYTES = // DRtXHDgC312wpNdNCSb8vCoXDcofCJcPHdAw4VkJ8L9i
    // prettier-ignore
    new Uint8Array([
        0xb8, 0xac, 0x70, 0x4f, 0xaf, 0xc7, 0xa5, 0xfc, 0x8c, 0x5d, 0x1f, 0x0a, 0xc8, 0xcf, 0xaa, 0xe0,
        0x42, 0xfa, 0x3b, 0xb8, 0x25, 0xf0, 0xec, 0xfc, 0xe2, 0x27, 0x4d, 0x7d, 0xad, 0xad, 0x51, 0x2d,
    ]);

async function getSecretKey() {
    return await crypto.subtle.importKey('pkcs8', MOCK_PKCS8_PRIVATE_KEY, 'Ed25519', /* extractable */ false, ['sign']);
}

describe('sendTransaction', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` preflight commitment`, () => {
            if (commitment === 'finalized') {
                it.todo(
                    'returns the transaction signature (test broken; see https://discord.com/channels/428295358100013066/560496939779620864/1132048104728825926)'
                );
                return;
            }
            it('returns the transaction signature', async () => {
                expect.assertions(1);
                const [secretKey, { value: latestBlockhash }] = await Promise.all([
                    getSecretKey(),
                    rpc.getLatestBlockhash().send(),
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
                            ])
                        ).toString('base64') as Base64EncodedWireTransaction,
                        { encoding: 'base64', preflightCommitment: commitment }
                    )
                    .send();
                await expect(resultPromise).resolves.toEqual(getBase58Decoder().decode(signature)[0]);
            });
        });
    });
    it('fatals when called with a transaction having an invalid signature', async () => {
        expect.assertions(1);
        const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
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
                    ])
                ).toString('base64') as Base64EncodedWireTransaction,
                { encoding: 'base64', preflightCommitment: 'processed' }
            )
            .send();
        await expect(resultPromise).rejects.toMatchObject({
            code: -32003 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_TRANSACTION_SIGNATURE_VERIFICATION_FAILURE'],
            message: expect.stringContaining('Transaction signature verification failure'),
            name: 'SolanaJsonRpcError',
        });
    });
    it('fatals when called with a transaction having an unsupported version', async () => {
        expect.assertions(1);
        const [secretKey, { value: latestBlockhash }] = await Promise.all([
            getSecretKey(),
            rpc.getLatestBlockhash().send(),
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
                    ])
                ).toString('base64') as Base64EncodedWireTransaction,
                { encoding: 'base64', preflightCommitment: 'processed' }
            )
            .send();
        await expect(resultPromise).rejects.toMatchObject({
            code: -32602 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
            message: expect.stringContaining(
                'invalid value: integer `126`, expected a valid transaction message version'
            ),
            name: 'SolanaJsonRpcError',
        });
    });
    it('fatals when called with a malformed transaction message', async () => {
        expect.assertions(1);
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
                    ])
                ).toString('base64') as Base64EncodedWireTransaction,
                { encoding: 'base64', preflightCommitment: 'processed' }
            )
            .send();
        await expect(resultPromise).rejects.toMatchObject({
            code: -32602 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
            message: expect.stringContaining('failed to fill whole buffer'),
            name: 'SolanaJsonRpcError',
        });
    });
    it('fatals when the fee payer has insufficient funds', async () => {
        expect.assertions(1);
        const [[secretKey, publicKeyBytes], { value: latestBlockhash }] = await Promise.all([
            (async () => {
                const keyPair = (await crypto.subtle.generateKey('Ed25519', /* extractable */ false, [
                    'sign',
                    'verify',
                ])) as CryptoKeyPair;
                return [keyPair.privateKey, new Uint8Array(await crypto.subtle.exportKey('raw', keyPair.publicKey))];
            })(),
            rpc.getLatestBlockhash().send(),
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
                    ])
                ).toString('base64') as Base64EncodedWireTransaction,
                { encoding: 'base64', preflightCommitment: 'processed' }
            )
            .send();
        await expect(resultPromise).rejects.toMatchObject({
            code: -32002 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE'],
            message: expect.stringContaining('Attempt to debit an account but found no record of a prior credit'),
            name: 'SolanaJsonRpcError',
        });
    });
    it('fatals when the blockhash does not exist', async () => {
        expect.assertions(1);
        const secretKey = await getSecretKey();
        const message = getMockTransactionMessage({
            blockhash: getBase58Decoder().decode(new Uint8Array(Array(32).fill(0)))[0],
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
                    ])
                ).toString('base64') as Base64EncodedWireTransaction,
                { encoding: 'base64', preflightCommitment: 'processed' }
            )
            .send();
        await expect(resultPromise).rejects.toMatchObject({
            code: -32002 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE'],
            message: expect.stringContaining('Blockhash not found'),
            name: 'SolanaJsonRpcError',
        });
    });
    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const [secretKey, { value: latestBlockhash }] = await Promise.all([
                getSecretKey(),
                rpc.getLatestBlockhash().send(),
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
                        ])
                    ).toString('base64') as Base64EncodedWireTransaction,
                    {
                        encoding: 'base64',
                        minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                        preflightCommitment: 'processed',
                    }
                )
                .send();
            await expect(resultPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });
});
