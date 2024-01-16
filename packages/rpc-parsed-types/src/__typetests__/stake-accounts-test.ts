import { Address } from '@solana/addresses';
import { StringifiedBigInt, UnixTimestamp } from '@solana/rpc-types';

import type { JsonParsedStakeProgramAccount } from '../stake-accounts';

// initialized stake account
{
    const account = {
        info: {
            meta: {
                authorized: {
                    staker: '3HRNKNXafhr3wE9NSXRpNVdFYt6EVygdqFwqf6WpG57V' as Address,
                    withdrawer: '3HRNKNXafhr3wE9NSXRpNVdFYt6EVygdqFwqf6WpG57V' as Address,
                },
                lockup: {
                    custodian: '11111111111111111111111111111111' as Address,
                    epoch: 0n,
                    unixTimestamp: 0 as UnixTimestamp,
                },
                rentExemptReserve: '2282880' as StringifiedBigInt,
            },
            stake: {
                creditsObserved: 169965713n,
                delegation: {
                    activationEpoch: '386' as StringifiedBigInt,
                    deactivationEpoch: '471' as StringifiedBigInt,
                    stake: '8007935' as StringifiedBigInt,
                    voter: 'CertusDeBmqN8ZawdkxK5kFGMwBXdudvWHYwtNgNhvLu' as Address,
                    warmupCooldownRate: 0.25,
                },
            },
        },
        type: 'initialized' as const,
    };
    account satisfies JsonParsedStakeProgramAccount;
}

{
    const account = {} as unknown as JsonParsedStakeProgramAccount;
    if (account.type === 'initialized') {
        account.info.meta.authorized.staker satisfies Address;
    }
}

// delegated stake account
{
    const account = {
        info: {
            meta: {
                authorized: {
                    staker: '3HRNKNXafhr3wE9NSXRpNVdFYt6EVygdqFwqf6WpG57V' as Address,
                    withdrawer: '3HRNKNXafhr3wE9NSXRpNVdFYt6EVygdqFwqf6WpG57V' as Address,
                },
                lockup: {
                    custodian: '11111111111111111111111111111111' as Address,
                    epoch: 0n,
                    unixTimestamp: 0 as UnixTimestamp,
                },
                rentExemptReserve: '2282880' as StringifiedBigInt,
            },
            stake: {
                creditsObserved: 169965713n,
                delegation: {
                    activationEpoch: '386' as StringifiedBigInt,
                    deactivationEpoch: '471' as StringifiedBigInt,
                    stake: '8007935' as StringifiedBigInt,
                    voter: 'CertusDeBmqN8ZawdkxK5kFGMwBXdudvWHYwtNgNhvLu' as Address,
                    warmupCooldownRate: 0.25,
                },
            },
        },
        type: 'delegated' as const,
    };
    account satisfies JsonParsedStakeProgramAccount;
}

{
    const account = {} as unknown as JsonParsedStakeProgramAccount;
    if (account.type === 'delegated') {
        account.info.meta.authorized.staker satisfies Address;
    }
}
