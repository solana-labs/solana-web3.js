import type { Rpc } from '@solana/rpc-spec';

import { GetInflationRateApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getInflationRate', () => {
    let rpc: Rpc<GetInflationRateApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    // TODO: I honestly have no clue how to test this
    describe(`when called`, () => {
        it('returns the inflation rate result with expected formatting', async () => {
            expect.assertions(1);
            const result = await rpc.getInflationRate().send();
            expect(result).toStrictEqual({
                epoch: expect.any(BigInt),
                foundation: expect.any(Number),
                total: expect.any(Number),
                validator: expect.any(Number),
            });
        });
    });
});
