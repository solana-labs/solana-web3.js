import { Address } from '@solana/addresses';
import { StringifiedBigInt, UnixTimestamp } from '@solana/rpc-types';

import { RpcParsedType } from './rpc-parsed-type';

type JsonParsedStakeAccount = Readonly<{
    meta: Readonly<{
        rentExemptReserve: StringifiedBigInt;
        authorized: Readonly<{
            staker: Address;
            withdrawer: Address;
        }>;
        lockup: Readonly<{
            unixTimestamp: UnixTimestamp;
            epoch: bigint;
            custodian: Address;
        }>;
    }>;
    stake: Readonly<{
        delegation: Readonly<{
            voter: Address;
            stake: StringifiedBigInt;
            activationEpoch: StringifiedBigInt;
            deactivationEpoch: StringifiedBigInt;
            warmupCooldownRate: number;
        }>;
        creditsObserved: bigint;
    }> | null;
}>;

export type JsonParsedStakeProgramAccount =
    | RpcParsedType<'initialized', JsonParsedStakeAccount>
    | RpcParsedType<'delegated', JsonParsedStakeAccount>;
