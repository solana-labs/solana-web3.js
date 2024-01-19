import { Address } from '@solana/addresses';

import { AccountLoaderArgs } from '../loaders/account';

export type AccountCallAddress = Address | { parentFieldName: string; parentIndex: number } | null;
export type AccountCallArgSet = Omit<AccountLoaderArgs, 'address'>;
export type AccountCall = {
    address: AccountCallAddress;
    argSets: AccountCallArgSet[];
};

type Call = AccountCall; // | BlockCall | TransactionCall ...etc
type CallSet = { accounts: AccountCall[] };
export type CallChain = CallSet[];

export function getParent(callChain: CallChain, depth: number, field: keyof CallSet): [Call, number] {
    const parentDepth = depth - 1;
    const parentIndex = callChain[parentDepth][field].length - 1;
    const parent = callChain[parentDepth][field][parentIndex];
    return [parent, parentIndex];
}

export function findMatchOrPush<T>(arr: T[], item: T) {
    arr.find(a => (typeof a === 'object' ? JSON.stringify(a) === JSON.stringify(item) : a === item)) || arr.push(item);
}
