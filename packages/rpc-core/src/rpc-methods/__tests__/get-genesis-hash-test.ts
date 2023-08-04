import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fs from 'fs';
import fetchMock from 'jest-fetch-mock-fork';
import path from 'path';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

const logFilePath = path.resolve(__dirname, '../../../../../test-ledger/validator.log');
const genesisHashPattern = /genesis hash: ([\d\w]{32,})/;

describe('getGenesisHash', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    describe('when sent to a local validator', () => {
        it('returns the genesis hash', async () => {
            expect.assertions(1);
            const logFile = fs.readFileSync(logFilePath, 'utf-8');
            const expectedGenesisHash = logFile.match(genesisHashPattern)?.[1];
            const genesisHashPromise = rpc.getGenesisHash().send();
            await expect(genesisHashPromise).resolves.toBe(expectedGenesisHash);
        });
    });
});
