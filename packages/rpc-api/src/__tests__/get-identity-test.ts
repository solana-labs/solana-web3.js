import { open } from 'node:fs/promises';

import type { Address } from '@solana/addresses';
import { getBase58Decoder } from '@solana/codecs-strings';
import type { Rpc } from '@solana/rpc-spec';
import path from 'path';

import { GetIdentityApi } from '../index';
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

describe('getIdentity', () => {
    let rpc: Rpc<GetIdentityApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    it('returns the identity of the currently running local validator', async () => {
        expect.assertions(1);
        const expectedAddress = await getValidatorAddress();
        const identityPromise = rpc.getIdentity().send();
        await expect(identityPromise).resolves.toStrictEqual({
            identity: expectedAddress,
        });
    });
});
