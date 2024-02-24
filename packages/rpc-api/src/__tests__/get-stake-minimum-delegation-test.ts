import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';

import { GetStakeMinimumDelegationApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getStakeMinimumDelegation', () => {
    let rpc: Rpc<GetStakeMinimumDelegationApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns the result as a bigint wrapped in an RpcResponse', async () => {
                expect.assertions(1);
                const result = await rpc.getStakeMinimumDelegation({ commitment }).send();
                expect(result.value).toEqual(expect.any(BigInt));
            });
        });
    });
});
