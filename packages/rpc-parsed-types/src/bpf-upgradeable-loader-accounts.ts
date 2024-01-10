import { Address } from '@solana/addresses';
import { Base64EncodedDataResponse } from '@solana/rpc-types';

type ProgramAccount = Readonly<{
    programData: Address;
}>;

type ProgramDataAccount = Readonly<{
    authority?: Address;
    data: Base64EncodedDataResponse;
    slot: bigint;
}>;

export type BpfUpgradeableProgramAccounts =
    | Readonly<{
          info: ProgramAccount;
          type: 'program';
      }>
    | Readonly<{
          info: ProgramDataAccount;
          type: 'programData';
      }>;
