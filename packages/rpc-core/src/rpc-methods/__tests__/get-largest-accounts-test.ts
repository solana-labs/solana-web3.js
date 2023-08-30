import { open } from 'node:fs/promises';

import { base58 } from '@metaplex-foundation/umi-serializers';
import { Base58EncodedAddress } from '@solana/addresses';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';
import path from 'path';

import { Commitment } from '../common';
import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

const faucetKeypairPath = path.resolve(__dirname, '../../../../../test-ledger/faucet-keypair.json');
const validatorKeypairPath = path.resolve(__dirname, '../../../../../test-ledger/validator-keypair.json');
const voteAccountKeypairPath = path.resolve(__dirname, '../../../../../test-ledger/vote-account-keypair.json');

async function getNodeAddress(path: string) {
    const file = await open(path);
    try {
        let secretKey: Uint8Array | undefined;
        for await (const line of file.readLines({ encoding: 'binary' })) {
            secretKey = new Uint8Array(JSON.parse(line));
            break; // Only need the first line
        }
        if (secretKey) {
            const publicKey = secretKey.slice(32, 64);
            const expectedAddress = base58.deserialize(publicKey)[0];
            return expectedAddress as Base58EncodedAddress;
        }
        throw new Error(`Failed to read keypair file \`${path}\``);
    } finally {
        await file.close();
    }
}

describe('getLargestAccounts', () => {
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
        describe(`when called with \`${commitment}\` commitment`, () => {
            describe('when called without filter', () => {
                it('returns a list of the largest accounts', async () => {
                    expect.assertions(1);
                    const faucetAddress = await getNodeAddress(faucetKeypairPath);
                    const validatorAddress = await getNodeAddress(validatorKeypairPath);
                    const voteAccountAddress = await getNodeAddress(voteAccountKeypairPath);
                    // TODO: Test validator does not write this keypair to JSON
                    // See solana-labs/solana/pull/33014
                    const stakeAddress = expect.any(String);
                    const largestAcountsPromise = rpc.getLargestAccounts({ commitment }).send();
                    await expect(largestAcountsPromise).resolves.toMatchObject({
                        context: {
                            slot: expect.any(BigInt), // Changes
                        },
                        value: expect.arrayContaining([
                            {
                                address: '2Pwe6Yahh5cbzvCwRMtTYFeboSwYiWeHhYJzZZBsU6eB',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: stakeAddress,
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: voteAccountAddress,
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: faucetAddress,
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: validatorAddress,
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'DoU57AYuPFu2QU514RktNPG22QhApEjnKxnBcu4BHDTY',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'DRtXHDgC312wpNdNCSb8vCoXDcofCJcPHdAw4VkJ8L9i',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'So11111111111111111111111111111111111111112',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'SysvarS1otHistory11111111111111111111111111',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'SysvarS1otHashes111111111111111111111111111',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'SysvarStakeHistory1111111111111111111111111',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'SysvarRecentB1ockHashes11111111111111111111',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'FtLZBmDW4Y6WNTYYZv9AcC2nQupDMDzX5Q5mp5MLpmdY',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo',
                                lamports: expect.any(BigInt), // Changes
                            },
                        ]),
                    });
                });
            });

            describe('when called with the `circulating` filter', () => {
                // TODO: This will always the same as above until we can mock
                // non-circulating accounts with the test validator.
                it('returns a list of the largest circulating accounts', async () => {
                    expect.assertions(1);
                    const faucetAddress = await getNodeAddress(faucetKeypairPath);
                    const validatorAddress = await getNodeAddress(validatorKeypairPath);
                    const voteAccountAddress = await getNodeAddress(voteAccountKeypairPath);
                    // TODO: Test validator does not write this keypair to JSON
                    // See solana-labs/solana/pull/33014
                    const stakeAddress = expect.any(String);
                    const largestAcountsPromise = rpc.getLargestAccounts({ commitment, filter: 'circulating' }).send();
                    await expect(largestAcountsPromise).resolves.toMatchObject({
                        context: {
                            slot: expect.any(BigInt), // Changes
                        },
                        // We can't guarantee ordering is preserved across test runs
                        value: expect.arrayContaining([
                            {
                                address: '2Pwe6Yahh5cbzvCwRMtTYFeboSwYiWeHhYJzZZBsU6eB',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: stakeAddress,
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: voteAccountAddress,
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: faucetAddress,
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: validatorAddress,
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'DoU57AYuPFu2QU514RktNPG22QhApEjnKxnBcu4BHDTY',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'DRtXHDgC312wpNdNCSb8vCoXDcofCJcPHdAw4VkJ8L9i',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'So11111111111111111111111111111111111111112',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'SysvarS1otHistory11111111111111111111111111',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'SysvarS1otHashes111111111111111111111111111',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'SysvarStakeHistory1111111111111111111111111',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'SysvarRecentB1ockHashes11111111111111111111',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'FtLZBmDW4Y6WNTYYZv9AcC2nQupDMDzX5Q5mp5MLpmdY',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN',
                                lamports: expect.any(BigInt), // Changes
                            },
                            {
                                address: 'CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo',
                                lamports: expect.any(BigInt), // Changes
                            },
                        ]),
                    });
                });
            });

            describe('when called with the `nonCirculating` filter', () => {
                // TODO: This will always be an empty array until we can mock it
                // with the test validator.
                it.todo('returns a list of the largest non-circulating accounts');
            });
        });
    });
});
