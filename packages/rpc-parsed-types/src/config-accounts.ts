import { Address } from '@solana/addresses';

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
    | Readonly<{
          info: StakeConfigAccount;
          type: 'stakeConfig';
      }>
    | Readonly<{
          info: ValidatorInfoAccount;
          type: 'validatorInfo';
      }>;
