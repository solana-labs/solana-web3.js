import { Address } from '@solana/addresses';
import { Blockhash, StringifiedBigInt } from '@solana/rpc-types';

import { NonceAccount } from '../nonce-accounts';

{
    const account = {
        authority: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe' as Address,
        blockhash: 'TcVy2wVcs7WqWVopv8LAJBHQfqVYZrm8UDqjDvBFQt8' as Blockhash,
        feeCalculator: {
            lamportsPerSignature: '5000' as StringifiedBigInt,
        },
    };
    account satisfies NonceAccount;
}
