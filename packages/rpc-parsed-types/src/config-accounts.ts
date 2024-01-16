import type { Address } from '@solana/addresses';

import type { RpcParsedType } from './rpc-parsed-type';

type JsonParsedStakeConfigAccount = Readonly<{
    slashPenalty: number;
    warmupCooldownRate: number;
}>;

type JsonParsedValidatorInfoAccount = Readonly<{
    configData: unknown;
    keys: {
        pubkey: Address;
        signer: boolean;
    }[];
}>;

export type JsonParsedConfigProgramAccount =
    | RpcParsedType<'stakeConfig', JsonParsedStakeConfigAccount>
    | RpcParsedType<'validatorInfo', JsonParsedValidatorInfoAccount>;
