import type { Rpc } from '@solana/rpc-spec';
import type { Blockhash, Commitment } from '@solana/rpc-types';

import { IsBlockhashValidApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('isBlockhashValid', () => {
    let rpc: Rpc<IsBlockhashValidApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns the result as a bool wrapped in an RpcResponse', async () => {
                expect.assertions(1);
                const blockhash = '9PCVWkKP3bq1sT5eLFurUysMvVs4PxJsTfza5QSBB4d1' as Blockhash;
                const result = await rpc.isBlockhashValid(blockhash, { commitment }).send();
                expect(result.value).toEqual(expect.any(Boolean));
            });
        });
    });
});
