import { Address } from '@solana/addresses';
import { Commitment, Rpc, Slot } from '@solana/rpc-types';

import { GetBlockProductionApi } from '../getBlockProduction';

const rpc = null as unknown as Rpc<GetBlockProductionApi>;
const identity = 'Joe11111111111111111111111111111' as Address<'Joe11111111111111111111111111111'>;

// Parameters
const params = null as unknown as Parameters<GetBlockProductionApi['getBlockProduction']>[0];
params satisfies { commitment?: Commitment } | undefined;
params satisfies { range?: { firstSlot: Slot; lastSlot: Slot } } | undefined;
params satisfies { identity?: Address } | undefined;

async () => {
    {
        const result = await rpc.getBlockProduction().send();
        if (result.value) {
            const { range, byIdentity } = result.value;
            range satisfies { firstSlot: Slot; lastSlot: Slot };
            byIdentity satisfies Record<Address, [bigint, bigint]>;
        }
    }

    {
        const result = await rpc.getBlockProduction({ identity }).send();
        if (result.value) {
            const { range, byIdentity } = result.value;
            range satisfies { firstSlot: Slot; lastSlot: Slot };
            byIdentity satisfies Readonly<{ [x: Address]: [bigint, bigint] | undefined }>;
        }
    }
};
