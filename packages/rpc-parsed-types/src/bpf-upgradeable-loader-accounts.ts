import type { Address } from '@solana/addresses';
import type { Base64EncodedDataResponse, Slot } from '@solana/rpc-types';

import type { RpcParsedType } from './rpc-parsed-type';

type ProgramAccount = Readonly<{
    programData: Address;
}>;

type ProgramDataAccount = Readonly<{
    authority?: Address;
    data: Base64EncodedDataResponse;
    slot: Slot;
}>;

export type BpfUpgradeableProgramAccount =
    | RpcParsedType<'program', ProgramAccount>
    | RpcParsedType<'programData', ProgramDataAccount>;
