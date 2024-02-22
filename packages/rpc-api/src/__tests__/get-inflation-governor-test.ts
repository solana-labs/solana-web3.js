import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { GetInflationGovernorApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getInflationGovernor', () => {
    let rpc: Rpc<GetInflationGovernorApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createLocalhostSolanaRpc();
    });
    // TODO: I honestly have no clue how to test this
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns the inflation governor result with expected formatting', async () => {
                expect.assertions(1);
                const result = await rpc.getInflationGovernor({ commitment }).send();
                expect(result).toStrictEqual({
                    foundation: expect.any(Number),
                    foundationTerm: expect.any(Number),
                    initial: expect.any(Number),
                    taper: expect.any(Number),
                    terminal: expect.any(Number),
                });
            });
        });
    });
});
