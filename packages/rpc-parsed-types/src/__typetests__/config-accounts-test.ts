import { Address } from '@solana/addresses';

import { ConfigProgramAccount } from '../config-accounts';

// stake config account
{
    const account = {
        info: {
            slashPenalty: 12,
            warmupCooldownRate: 0.25,
        },
        type: 'stakeConfig' as const,
    };
    account satisfies ConfigProgramAccount;
}

{
    const account = {} as unknown as ConfigProgramAccount;
    if (account.type === 'stakeConfig') {
        account.info.slashPenalty satisfies number;
    }
}

// validator info account
{
    const account = {
        info: {
            configData: {
                name: 'HoldTheNode',
                website: 'https://holdthenode.com',
            },
            keys: [
                {
                    pubkey: 'Va1idator1nfo111111111111111111111111111111' as Address,
                    signer: false,
                },
                {
                    pubkey: '5hvJ19nRgtzAkosb5bcx9bqeN2QA1Qwxq4M349Q2L6s2' as Address,
                    signer: true,
                },
            ],
        },
        type: 'validatorInfo' as const,
    };
    account satisfies ConfigProgramAccount;
}
