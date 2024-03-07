import { Address } from '@solana/addresses';
import { StringifiedBigInt, UnixTimestamp } from '@solana/rpc-types';

import { RpcParsedType } from './rpc-parsed-type';

type JsonParsedStakeAccount = Readonly<{
    meta: Readonly<{
        authorized: Readonly<{
            staker: Address;
            withdrawer: Address;
        }>;
        lockup: Readonly<{
            custodian: Address;
            epoch: bigint;
            unixTimestamp: UnixTimestamp;
        }>;
        rentExemptReserve: StringifiedBigInt;
    }>;
    stake: Readonly<{
        creditsObserved: bigint;
        delegation: Readonly<{
            activationEpoch: StringifiedBigInt;
            deactivationEpoch: StringifiedBigInt;
            stake: StringifiedBigInt;
            voter: Address;
            warmupCooldownRate: number;
        }>;
    }> | null;
}>;

export type JsonParsedStakeProgramAccount =
    | RpcParsedType<'delegated', JsonParsedStakeAccount>
    | RpcParsedType<'initialized', JsonParsedStakeAccount>;
