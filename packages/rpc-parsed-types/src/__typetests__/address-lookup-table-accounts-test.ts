import { Address } from '@solana/addresses';
import { StringifiedBigInt } from '@solana/rpc-types';

import { JsonParsedAddressLookupTableAccount } from '../address-lookup-table-accounts';

const account = {
    info: {
        addresses: [
            'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address,
            'FWscgV4VDSsMxkQg7jZ4HksqjLyadJS5RiCnAVZv2se9' as Address,
        ],
        authority: '4msgK65vdz5ADUAB3eTQGpF388NuQUAoknLxutUQJd5B' as Address,
        deactivationSlot: '204699277' as StringifiedBigInt,
        lastExtendedSlot: '204699234' as StringifiedBigInt,
        lastExtendedSlotStartIndex: 20,
    },
};

account satisfies JsonParsedAddressLookupTableAccount;
