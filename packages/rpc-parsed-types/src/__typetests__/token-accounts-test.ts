import { Address } from '@solana/addresses';
import { StringifiedBigInt, StringifiedNumber } from '@solana/rpc-types';

import { JsonParsedTokenProgramAccount } from '../token-accounts';

// token account
{
    const account = {
        info: {
            isNative: false,
            mint: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' as Address,
            owner: '6UsGbaMgchgj4wiwKKuE1v5URHdcDfEiMSM25QpesKir' as Address,
            state: 'initialized' as const,
            tokenAmount: {
                amount: '9999999779500000' as StringifiedBigInt,
                decimals: 6,
                uiAmount: 9999999779.5,
                uiAmountString: '9999999779.5' as StringifiedNumber,
            },
        },
        type: 'account' as const,
    };
    account satisfies JsonParsedTokenProgramAccount;
}

{
    const account = {} as unknown as JsonParsedTokenProgramAccount;
    if (account.type === 'account') {
        account.info.mint satisfies Address;
    }
}

// mint account
{
    const account = {
        info: {
            decimals: 6,
            freezeAuthority: null,
            isInitialized: true,
            mintAuthority: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' as Address,
            supply: '1792635195340523528' as StringifiedBigInt,
        },
        type: 'mint' as const,
    };
    account satisfies JsonParsedTokenProgramAccount;
}

{
    const account = {} as unknown as JsonParsedTokenProgramAccount;
    if (account.type === 'mint') {
        account.info.supply satisfies StringifiedBigInt;
    }
}

// multisig account
{
    const account = {
        info: {
            isInitialized: true,
            numRequiredSigners: 2,
            numValidSigners: 2,
            signers: [
                'Fkc4FN7PPhyGsAcHPW3dBBJ4BvtYkDr2rBFBgFpvy3nB' as Address,
                '5scSndUhfZJ8j8wZz5UNHhvuPBhvN1RboTdkKSvFHLtW' as Address,
            ],
        },
        type: 'multisig' as const,
    };
    account satisfies JsonParsedTokenProgramAccount;
}

{
    const account = {} as unknown as JsonParsedTokenProgramAccount;
    if (account.type === 'multisig') {
        account.info.numRequiredSigners satisfies number;
    }
}
