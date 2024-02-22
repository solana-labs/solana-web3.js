import { Address } from '@solana/addresses';
import { Rpc } from '@solana/rpc-spec';

import { GetTokenAccountsByDelegateApi } from '..';

const rpc = {} as unknown as Rpc<GetTokenAccountsByDelegateApi>;

async () => {
    const tokenAccountsByDelegate = await rpc
        .getTokenAccountsByDelegate(
            'delegate' as Address,
            { programId: 'program' as Address },
            { encoding: 'jsonParsed' },
        )
        .send();

    const firstAccount = tokenAccountsByDelegate.value[0];
    firstAccount.pubkey satisfies Address;
    firstAccount.account.data.program satisfies Address;
    firstAccount.account.data.parsed.type satisfies 'account';
    firstAccount.account.data.parsed.info.mint satisfies Address;
};
