import { Base58EncodedAddress } from '@solana/addresses';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

// TODO: We may want to replace the higher clusters with just the local
// validator, since this is within the live test suite anyhow.
// Also, with further manipulation capabilities over the local validator,
// we can explore error testing as well
const genesisHashMap: [string, Base58EncodedAddress][] = [
    ['https://api.devnet.solana.com', 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG' as Base58EncodedAddress],
    ['https://api.testnet.solana.com', '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY' as Base58EncodedAddress],
    ['https://api.mainnet-beta.solana.com', '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d' as Base58EncodedAddress],
];

describe('getGenesisHash', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    const createRpcForTest = (url: string) => {
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url }),
        });
    };
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
    });

    genesisHashMap.forEach(([url, expectedGenesisHash]) => {
        describe(`when sent to ${url}`, () => {
            it(`returns ${expectedGenesisHash}`, async () => {
                expect.assertions(1);
                createRpcForTest(url);
                const genesisHashPromise = rpc.getGenesisHash().send();
                await expect(genesisHashPromise).resolves.toBe(expectedGenesisHash);
            });
        });
    });
});
