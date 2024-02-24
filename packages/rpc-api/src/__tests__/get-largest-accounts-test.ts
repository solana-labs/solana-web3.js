import { open } from 'node:fs/promises';

import type { Address } from '@solana/addresses';
import { getBase58Decoder } from '@solana/codecs-strings';
import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';
import path from 'path';

import { GetLargestAccountsApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

const faucetKeypairPath = path.resolve(__dirname, '../../../../test-ledger/faucet-keypair.json');
const validatorKeypairPath = path.resolve(__dirname, '../../../../test-ledger/validator-keypair.json');
const voteAccountKeypairPath = path.resolve(__dirname, '../../../../test-ledger/vote-account-keypair.json');

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
            const expectedAddress = getBase58Decoder().decode(publicKey);
            return expectedAddress as Address;
        }
        throw new Error(`Failed to read keypair file \`${path}\``);
    } finally {
        await file.close();
    }
}

describe('getLargestAccounts', () => {
    let rpc: Rpc<GetLargestAccountsApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            describe('when called without filter', () => {
                it('returns a list of the largest accounts', async () => {
                    expect.assertions(1);
                    const faucetAddress = await getNodeAddress(faucetKeypairPath);
                    const validatorAddress = await getNodeAddress(validatorKeypairPath);
                    const voteAccountAddress = await getNodeAddress(voteAccountKeypairPath);
                    const largestAcountsPromise = rpc.getLargestAccounts({ commitment }).send();
                    await expect(largestAcountsPromise).resolves.toStrictEqual({
                        context: CONTEXT_MATCHER,
                        // We can't guarantee ordering is preserved across test runs
                        value: expect.arrayContaining([
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
                    const largestAcountsPromise = rpc.getLargestAccounts({ commitment, filter: 'circulating' }).send();
                    await expect(largestAcountsPromise).resolves.toStrictEqual({
                        context: CONTEXT_MATCHER,
                        // We can't guarantee ordering is preserved across test runs
                        value: expect.arrayContaining([
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
