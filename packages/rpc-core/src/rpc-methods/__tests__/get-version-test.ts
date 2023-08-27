import { open } from 'node:fs/promises';

import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';
import path from 'path';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

const logFilePath = path.resolve(__dirname, '../../../../../test-ledger/validator.log');
const featureSetPattern = /feat:([\d]+)/;
const versionPattern = /solana-validator ([\d.]+)/;

async function getVersionFromLogFile() {
    const file = await open(logFilePath);
    try {
        let version: string | undefined;
        let featureSet: number | undefined;
        for await (const line of file.readLines({ encoding: 'utf-8' })) {
            const featureSetMatch = line.match(featureSetPattern);
            if (featureSetMatch) {
                featureSet = parseInt(featureSetMatch[1]);
            }
            const versionMatch = line.match(versionPattern);
            if (versionMatch) {
                version = versionMatch[1];
            }
            if (version && featureSet) {
                return [featureSet, version];
            }
        }
        throw new Error(`Version info not found in logfile \`${logFilePath}\``);
    } finally {
        await file.close();
    }
}

describe('getVersion', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    describe('when called on a valid node', () => {
        it('returns the version', async () => {
            expect.assertions(1);
            const [expectedFeatureSet, expectedVersion] = await getVersionFromLogFile();
            const versionPromise = rpc.getVersion().send();
            await expect(versionPromise).resolves.toMatchObject({
                'feature-set': expectedFeatureSet,
                'solana-core': expectedVersion,
            });
        });
    });
});
