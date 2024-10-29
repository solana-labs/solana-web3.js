import {
    assertAccountsDecoded,
    assertAccountsExist,
    type FetchAccountsConfig,
    fetchJsonParsedAccounts,
} from '@solana/accounts';
import type { Address } from '@solana/addresses';
import type { GetMultipleAccountsApi, Rpc } from '@solana/rpc';
import {
    type AddressesByLookupTableAddress,
    CompilableTransactionMessage,
    CompiledTransactionMessage,
    decompileTransactionMessage,
} from '@solana/transaction-messages';

type FetchedAddressLookup = {
    addresses: Address[];
};

async function fetchLookupTables(
    lookupTableAddresses: Address[],
    rpc: Rpc<GetMultipleAccountsApi>,
    config?: FetchAccountsConfig,
): Promise<AddressesByLookupTableAddress> {
    const fetchedLookupTables = await fetchJsonParsedAccounts<FetchedAddressLookup[]>(
        rpc,
        lookupTableAddresses,
        config,
    );
    assertAccountsDecoded(fetchedLookupTables);
    assertAccountsExist(fetchedLookupTables);

    return fetchedLookupTables.reduce<AddressesByLookupTableAddress>((acc, lookup) => {
        return {
            ...acc,
            [lookup.address]: lookup.data.addresses,
        };
    }, {});
}

type DecompileTransactionMessageFetchingLookupTablesConfig = FetchAccountsConfig & {
    lastValidBlockHeight?: bigint;
};

export async function decompileTransactionMessageFetchingLookupTables(
    compiledTransactionMessage: CompiledTransactionMessage,
    rpc: Rpc<GetMultipleAccountsApi>,
    config?: DecompileTransactionMessageFetchingLookupTablesConfig,
): Promise<CompilableTransactionMessage> {
    const lookupTables =
        'addressTableLookups' in compiledTransactionMessage &&
        compiledTransactionMessage.addressTableLookups !== undefined &&
        compiledTransactionMessage.addressTableLookups.length > 0
            ? compiledTransactionMessage.addressTableLookups
            : [];
    const lookupTableAddresses = lookupTables.map(l => l.lookupTableAddress);

    const { lastValidBlockHeight, ...fetchAccountsConfig } = config ?? {};
    const addressesByLookupTableAddress =
        lookupTableAddresses.length > 0 ? await fetchLookupTables(lookupTableAddresses, rpc, fetchAccountsConfig) : {};

    return decompileTransactionMessage(compiledTransactionMessage, {
        addressesByLookupTableAddress,
        lastValidBlockHeight,
    });
}
