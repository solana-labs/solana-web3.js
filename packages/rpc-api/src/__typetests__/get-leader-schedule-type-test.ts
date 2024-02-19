import type { Address } from '@solana/addresses';
import type { Rpc } from '@solana/rpc-spec';
import type { Slot } from '@solana/rpc-types';

import type { GetLeaderScheduleApi } from '../getLeaderSchedule';

const rpc = null as unknown as Rpc<GetLeaderScheduleApi>;
const slot = 0n as Slot;
const identity = 'Joe11111111111111111111111111111' as Address<'Joe11111111111111111111111111111'>;

async () => {
    {
        const result = await rpc.getLeaderSchedule(slot).send();
        // Can be null if the slot corresponds to an epoch that does not exist
        result satisfies Record<Address, Slot[]> | null;
    }

    {
        const result = await rpc.getLeaderSchedule(null).send();
        // Won't be null
        result satisfies Record<Address, Slot[]>;
    }

    {
        const result = await rpc.getLeaderSchedule(slot, { identity }).send();
        // Can be null if the slot corresponds to an epoch that does not exist
        result satisfies Readonly<{ [key: Address]: Slot[] | undefined }> | null;
    }

    {
        const result = await rpc.getLeaderSchedule(null, { identity }).send();
        // Won't be null
        result satisfies Readonly<{ [key: Address]: Slot[] | undefined }>;
    }
};
