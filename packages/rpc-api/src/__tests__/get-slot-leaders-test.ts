import { open } from 'node:fs/promises';

import type { Address } from '@solana/addresses';
import { getBase58Decoder } from '@solana/codecs-strings';
import { SOLANA_ERROR__JSON_RPC__INVALID_PARAMS, SolanaError } from '@solana/errors';
import type { Rpc } from '@solana/rpc-spec';
import path from 'path';

import { GetSlotLeadersApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

const validatorKeypairPath = path.resolve(__dirname, '../../../../test-ledger/validator-keypair.json');

async function getValidatorAddress() {
    const file = await open(validatorKeypairPath);
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
        throw new Error(`Failed to read keypair file \`${validatorKeypairPath}\``);
    } finally {
        await file.close();
    }
}

describe('getSlotLeaders', () => {
    let rpc: Rpc<GetSlotLeadersApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    describe('when called with a valid slot', () => {
        // This will always be the local validator
        it('returns the node public keys', async () => {
            expect.assertions(2);
            const minimumLedgerSlot = (await rpc.minimumLedgerSlot().send()) as bigint;

            const result = await rpc.getSlotLeaders(minimumLedgerSlot, 3).send();
            expect(Array.isArray(result)).toBe(true);
            expect(result[0]).toEqual(await getValidatorAddress());
        });
    });

    describe('when called with a `startSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const sendPromise = rpc
                .getSlotLeaders(
                    2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                    3,
                )
                .send();
            await expect(sendPromise).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__JSON_RPC__INVALID_PARAMS, {
                    __serverMessage: 'Invalid slot range: leader schedule for epoch 21350398233460 is unavailable',
                }),
            );
        });
    });

    describe('when called with a `limit` greater than 5000', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const minimumLedgerSlot = (await rpc.minimumLedgerSlot().send()) as bigint;

            const sendPromise = rpc.getSlotLeaders(minimumLedgerSlot, 5001).send();
            await expect(sendPromise).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__JSON_RPC__INVALID_PARAMS, {
                    __serverMessage: 'Invalid limit; max 5000',
                }),
            );
        });
    });
});
