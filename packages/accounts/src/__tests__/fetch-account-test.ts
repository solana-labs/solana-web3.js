import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';

import {
    fetchEncodedAccount,
    fetchEncodedAccounts,
    fetchJsonParsedAccount,
    fetchJsonParsedAccounts,
} from '../fetch-account';
import { MaybeAccount, MaybeEncodedAccount } from '../maybe-account';
import { Base64RpcAccount, getMockRpc, JsonParsedRpcAccount } from './__setup__';

describe('fetchEncodedAccount', () => {
    it('fetches and parses an existing base64-encoded account from an RPC', async () => {
        expect.assertions(2);

        // Given a mock RPC client returning a mock account at a given address.
        const address = '1111' as Address<'1111'>;
        const rpc = getMockRpc({
            [address]: <Base64RpcAccount>{
                data: ['somedata', 'base64'],
                executable: false,
                lamports: 1_000_000_000n,
                owner: '9999',
            },
        });

        // When we fetch that account using the fetchEncodedAccount function.
        const account = await fetchEncodedAccount(rpc, address);

        // Then we expect the following parsed encoded account to be returned.
        account satisfies MaybeEncodedAccount;
        expect(account).toStrictEqual({
            address,
            data: new Uint8Array([178, 137, 158, 117, 171, 90]),
            executable: false,
            exists: true,
            lamports: 1_000_000_000n,
            programAddress: '9999',
        });

        // And the getAccountInfo RPC method to have been called with the given address and an explicit base64 encoding.
        expect(rpc.getAccountInfo).toHaveBeenCalledWith(address, { encoding: 'base64' });
    });

    it('fetches and parses a missing encoded account from an RPC', async () => {
        expect.assertions(2);

        // Given an address and a mock RPC that does not contain an account at that address.
        const address = '1111' as Address<'1111'>;
        const rpc = getMockRpc({});

        // When we try to fetch the account at that address using the fetchEncodedAccount function.
        const account = await fetchEncodedAccount(rpc, address);

        // Then we expect the following non-existing account to be returned.
        account satisfies MaybeEncodedAccount;
        expect(account).toStrictEqual({ address, exists: false });

        // And the getAccountInfo RPC method to have been called with the given address and an explicity base64 encoding.
        expect(rpc.getAccountInfo).toHaveBeenCalledWith(address, { encoding: 'base64' });
    });

    it('freezes the returned account', async () => {
        expect.assertions(1);

        // Given a mock RPC client returning a mock account at a given address.
        const address = '1111' as Address<'1111'>;
        const rpc = getMockRpc({
            [address]: <Base64RpcAccount>{
                data: ['somedata', 'base64'],
                executable: false,
                lamports: 1_000_000_000n,
                owner: '9999',
            },
        });

        // When we fetch that account using the fetchEncodedAccount function.
        const account = await fetchEncodedAccount(rpc, address);

        // Then we expect the returned account to be frozen.
        expect(account).toBeFrozenObject();
    });
});

describe('fetchJsonParsedAccount', () => {
    it('fetches and parses an existing jsonParsed account from an RPC', async () => {
        expect.assertions(2);

        // Given a mock RPC client returning a mock jsonParsed account at a given address.
        const address = '1111' as Address<'1111'>;
        const rpc = getMockRpc({
            [address]: <JsonParsedRpcAccount>{
                data: {
                    parsed: {
                        info: { mint: '2222' as Address<'2222'>, owner: '3333' as Address<'3333'> },
                        type: 'token',
                    },
                    program: 'splToken',
                    space: 165n,
                },
                executable: false,
                lamports: 1_000_000_000n,
                owner: '9999',
            },
        });

        // When we fetch that account using the jsonParsed encoding.
        type MyData = { mint: Address; owner: Address };
        const account = await fetchJsonParsedAccount<MyData>(rpc, address);

        // Then we expect the following jsonParsed encoded account to be returned.
        account satisfies MaybeAccount<MyData> | MaybeEncodedAccount;
        expect(account).toStrictEqual(<MaybeAccount<MyData>>{
            address,
            data: { mint: '2222' as Address<'2222'>, owner: '3333' as Address<'3333'> },
            executable: false,
            exists: true,
            lamports: 1_000_000_000n,
            programAddress: '9999',
        });

        // And the getAccountInfo RPC method to have been called with the given address and an explicit jsonParsed encoding.
        expect(rpc.getAccountInfo).toHaveBeenCalledWith(address, { encoding: 'jsonParsed' });
    });

    it('fetches and parses a missing encoded account from an RPC', async () => {
        expect.assertions(2);

        // Given an address and a mock RPC that does not contain an account at that address.
        const address = '1111' as Address<'1111'>;
        const rpc = getMockRpc({});

        // When we try to fetch the account at that address using the fetchJsonParsedAccount function.
        type MyData = { mint: Address; owner: Address };
        const account = await fetchJsonParsedAccount<MyData>(rpc, address);

        // Then we expect the following non-existing account to be returned.
        account satisfies MaybeAccount<MyData> | MaybeEncodedAccount;
        expect(account).toStrictEqual({ address, exists: false });

        // And the getAccountInfo RPC method to have been called with the given address and an explicity jsonParsed encoding.
        expect(rpc.getAccountInfo).toHaveBeenCalledWith(address, { encoding: 'jsonParsed' });
    });

    it('freezes the returned account', async () => {
        expect.assertions(1);

        // Given a mock RPC client returning a mock account at a given address.
        const address = '1111' as Address<'1111'>;
        const rpc = getMockRpc({
            [address]: <JsonParsedRpcAccount>{
                data: {
                    parsed: {
                        info: { mint: '2222' as Address<'2222'>, owner: '3333' as Address<'3333'> },
                        type: 'token',
                    },
                    program: 'splToken',
                    space: 165n,
                },
                executable: false,
                lamports: 1_000_000_000n,
                owner: '9999',
            },
        });

        // When we fetch that account using the fetchJsonParsedAccount function.
        const account = await fetchJsonParsedAccount(rpc, address);

        // Then we expect the returned account to be frozen.
        expect(account).toBeFrozenObject();
    });
});

describe('fetchEncodedAccounts', () => {
    it('fetches and parses multiple accounts from an RPC', async () => {
        expect.assertions(3);

        // Given two addresses A and B.
        const addressA = '1111' as Address<'1111'>;
        const addressB = '2222' as Address<'2222'>;

        // And a mock RPC client such that A exists and B does not.
        const rpc = getMockRpc({
            [addressA]: <Base64RpcAccount>{
                data: ['somedata', 'base64'],
                executable: false,
                lamports: 1_000_000_000n,
                owner: '9999',
            },
        });

        // When we fetch both of these accounts using the fetchEncodedAccounts function.
        const [accountA, accountB] = await fetchEncodedAccounts(rpc, [addressA, addressB]);

        // Then each account is returned as a MaybeEncodedAccount.
        accountA satisfies MaybeEncodedAccount;
        accountB satisfies MaybeEncodedAccount;

        // And account A is returned as an existing account.
        expect(accountA).toStrictEqual({
            address: addressA,
            data: new Uint8Array([178, 137, 158, 117, 171, 90]),
            executable: false,
            exists: true,
            lamports: 1_000_000_000n,
            programAddress: '9999',
        });

        // And account B is returned as a non-existing account.
        expect(accountB).toStrictEqual({ address: addressB, exists: false });

        // And the getMultipleAccounts RPC method to have been called with the given addresses and an explicity base64 encoding.
        expect(rpc.getMultipleAccounts).toHaveBeenCalledWith([addressA, addressB], { encoding: 'base64' });
    });

    it('freezes the returned accounts', async () => {
        expect.assertions(2);

        // Given two addresses A and B.
        const addressA = '1111' as Address<'1111'>;
        const addressB = '2222' as Address<'2222'>;

        // And a mock RPC client such that A exists and B does not.
        const rpc = getMockRpc({
            [addressA]: <Base64RpcAccount>{
                data: ['somedata', 'base64'],
                executable: false,
                lamports: 1_000_000_000n,
                owner: '9999',
            },
        });

        // When we fetch both of these accounts using the fetchEncodedAccounts function.
        const [accountA, accountB] = await fetchEncodedAccounts(rpc, [addressA, addressB]);

        // Then both accounts are frozen.
        expect(accountA).toBeFrozenObject();
        expect(accountB).toBeFrozenObject();
    });
});

describe('fetchJsonParsedAccounts', () => {
    it('fetches and parses multiple accounts from an RPC', async () => {
        expect.assertions(3);

        // Given two addresses A and B.
        const addressA = '1111' as Address<'1111'>;
        const addressB = '2222' as Address<'2222'>;

        // And a mock RPC client such that A exists and B does not.
        const rpc = getMockRpc({
            [addressA]: <JsonParsedRpcAccount>{
                data: {
                    parsed: {
                        info: { mint: '3333' as Address<'3333'>, owner: '4444' as Address<'4444'> },
                        type: 'token',
                    },
                    program: 'splToken',
                    space: 165n,
                },
                executable: false,
                lamports: 1_000_000_000n,
                owner: '9999',
            },
        });

        // When we fetch both of these accounts using the fetchJsonParsedAccounts function.
        type MyData = { mint: Address; owner: Address };
        const [accountA, accountB] = await fetchJsonParsedAccounts<MyData[]>(rpc, [addressA, addressB]);

        // Then each account is returned as a MaybeEncodedAccount.
        accountA satisfies MaybeAccount<MyData> | MaybeEncodedAccount;
        accountB satisfies MaybeAccount<MyData> | MaybeEncodedAccount;

        // And account A is returned as an existing account.
        expect(accountA).toStrictEqual({
            address: addressA,
            data: { mint: '3333', owner: '4444' },
            executable: false,
            exists: true,
            lamports: 1_000_000_000n,
            programAddress: '9999',
        });

        // And account B is returned as a non-existing account.
        expect(accountB).toStrictEqual({ address: addressB, exists: false });

        // And the getMultipleAccounts RPC method to have been called with the given addresses and an explicity jsonParsed encoding.
        expect(rpc.getMultipleAccounts).toHaveBeenCalledWith([addressA, addressB], { encoding: 'jsonParsed' });
    });

    it('freezes the returned accounts', async () => {
        expect.assertions(2);

        // Given two addresses A and B.
        const addressA = '1111' as Address<'1111'>;
        const addressB = '2222' as Address<'2222'>;

        // And a mock RPC client such that A exists and B does not.
        const rpc = getMockRpc({
            [addressA]: <JsonParsedRpcAccount>{
                data: {
                    parsed: {
                        info: { mint: '3333' as Address<'3333'>, owner: '4444' as Address<'4444'> },
                        type: 'token',
                    },
                    program: 'splToken',
                    space: 165n,
                },
                executable: false,
                lamports: 1_000_000_000n,
                owner: '9999',
            },
        });

        // When we fetch both of these accounts using the fetchJsonParsedAccounts function.
        const [accountA, accountB] = await fetchJsonParsedAccounts(rpc, [addressA, addressB]);

        // Then both accounts are frozen.
        expect(accountA).toBeFrozenObject();
        expect(accountB).toBeFrozenObject();
    });
});
