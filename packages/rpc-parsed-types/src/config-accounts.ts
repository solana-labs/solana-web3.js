import { Address } from '@solana/addresses';

import { RpcParsedType } from './rpc-parsed-type';

type StakeConfigAccount = Readonly<{
    slashPenalty: number;
    warmupCooldownRate: number;
}>;

type ValidatorInfoAccount = Readonly<{
    configData: unknown;
    keys: {
        pubkey: Address;
        signer: boolean;
    }[];
}>;

export type ConfigProgramAccount =
    | RpcParsedType<'stakeConfig', StakeConfigAccount>
    | RpcParsedType<'validatorInfo', ValidatorInfoAccount>;
