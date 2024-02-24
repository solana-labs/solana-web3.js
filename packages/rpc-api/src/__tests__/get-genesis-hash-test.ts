import { open } from 'node:fs/promises';

import type { Rpc } from '@solana/rpc-spec';
import path from 'path';

import { GetGenesisHashApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

const logFilePath = path.resolve(__dirname, '../../../../test-ledger/validator.log');
const genesisHashPattern = /genesis hash: ([\d\w]{32,})/;

async function getGenesisHashFromLogFile() {
    const file = await open(logFilePath);
    try {
        for await (const line of file.readLines({ encoding: 'utf-8' })) {
            const match = line.match(genesisHashPattern);
            if (match) {
                return match[1];
            }
        }
        throw new Error(`Genesis hash not found in logfile \`${logFilePath}\``);
    } finally {
        await file.close();
    }
}

describe('getGenesisHash', () => {
    let rpc: Rpc<GetGenesisHashApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    describe('when sent to a local validator', () => {
        it('returns the genesis hash', async () => {
            expect.assertions(1);
            const expectedGenesisHash = await getGenesisHashFromLogFile();
            const genesisHashPromise = rpc.getGenesisHash().send();
            await expect(genesisHashPromise).resolves.toBe(expectedGenesisHash);
        });
    });
});
