import { isSignerRole, isWritableRole } from '@solana/instructions';

import { OrderedAccounts } from './accounts';

type MessageHeader = Readonly<{
    numReadonlyNonSignerAccounts: number;
    numReadonlySignerAccounts: number;
    numSignerAccounts: number;
}>;

export function getCompiledMessageHeader(orderedAccounts: OrderedAccounts): MessageHeader {
    let numReadonlyNonSignerAccounts = 0;
    let numReadonlySignerAccounts = 0;
    let numSignerAccounts = 0;
    for (const account of orderedAccounts) {
        if ('lookupTableAddress' in account) {
            break;
        }
        const accountIsWritable = isWritableRole(account.role);
        if (isSignerRole(account.role)) {
            numSignerAccounts++;
            if (!accountIsWritable) {
                numReadonlySignerAccounts++;
            }
        } else if (!accountIsWritable) {
            numReadonlyNonSignerAccounts++;
        }
    }
    return {
        numReadonlyNonSignerAccounts,
        numReadonlySignerAccounts,
        numSignerAccounts,
    };
}
