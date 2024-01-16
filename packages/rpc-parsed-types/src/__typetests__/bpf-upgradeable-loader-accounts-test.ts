import { Address } from '@solana/addresses';
import { Base64EncodedDataResponse } from '@solana/rpc-types';

import { JsonParsedBpfUpgradeableLoaderProgramAccount } from '../bpf-upgradeable-loader-accounts';

// program account
{
    const account = {
        info: {
            programData: '3vnUTQbDuCgfVn7yQcigUwMQNGkLBZ7GfKWb3gYbAY23' as Address,
        },
        type: 'program' as const,
    };
    account satisfies JsonParsedBpfUpgradeableLoaderProgramAccount;
}

{
    const account = {} as unknown as JsonParsedBpfUpgradeableLoaderProgramAccount;
    if (account.type === 'program') {
        account.info.programData satisfies Address;
    }
}

// program data account
{
    const account = {
        info: {
            authority: '7g4Los4WMQnpxYiBJpU1HejBiM6xCk5RDFGCABhWE9M6' as Address,
            data: ['f0VMRgIBAAAAAAAAA', 'base64'] as Base64EncodedDataResponse,
            slot: 259942942n,
        },
        type: 'programData' as const,
    };
    account satisfies JsonParsedBpfUpgradeableLoaderProgramAccount;
}

{
    const account = {} as unknown as JsonParsedBpfUpgradeableLoaderProgramAccount;
    if (account.type === 'programData') {
        account.info.slot satisfies bigint;
    }
}
