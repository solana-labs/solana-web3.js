import { Address } from '@solana/addresses';
import { Rpc } from '@solana/rpc-spec';

import { GetTokenAccountsByOwnerApi } from '..';

const rpc = {} as unknown as Rpc<GetTokenAccountsByOwnerApi>;

async () => {
    const tokenAccountsByOwner = await rpc
        .getTokenAccountsByOwner('owner' as Address, { programId: 'program' as Address }, { encoding: 'jsonParsed' })
        .send();

    const firstAccount = tokenAccountsByOwner.value[0];
    firstAccount.pubkey satisfies Address;
    firstAccount.account.data.program satisfies Address;
    firstAccount.account.data.parsed.type satisfies 'account';
    firstAccount.account.data.parsed.info.mint satisfies Address;
};
