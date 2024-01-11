import { Address } from '@solana/addresses';
import { Base64EncodedDataResponse } from '@solana/rpc-types';

import { RpcParsedType } from './rpc-parsed-type';

type ProgramAccount = Readonly<{
    programData: Address;
}>;

type ProgramDataAccount = Readonly<{
    authority?: Address;
    data: Base64EncodedDataResponse;
    slot: bigint;
}>;

export type BpfUpgradeableProgramAccount =
    | RpcParsedType<'program', ProgramAccount>
    | RpcParsedType<'programData', ProgramDataAccount>;
