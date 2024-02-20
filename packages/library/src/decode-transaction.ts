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
    type CompilableTransaction,
    decompileTransaction,
    getCompiledTransactionDecoder,
    type ITransactionWithSignatures,
} from '@solana/transactions';

let compiledTransactionDecoder: ReturnType<typeof getCompiledTransactionDecoder> | undefined = undefined;

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

type DecodeTransactionConfig = FetchAccountsConfig & {
    lastValidBlockHeight?: bigint;
};

export async function decodeTransaction(
    encodedTransaction: Uint8Array,
    rpc: Rpc<GetMultipleAccountsApi>,
    config?: DecodeTransactionConfig,
): Promise<CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)> {
    const { lastValidBlockHeight, ...fetchAccountsConfig } = config ?? {};

    if (!compiledTransactionDecoder) compiledTransactionDecoder = getCompiledTransactionDecoder();
    const compiledTransaction = compiledTransactionDecoder.decode(encodedTransaction);
    const { compiledMessage } = compiledTransaction;

    const lookupTables =
        'addressTableLookups' in compiledMessage &&
        compiledMessage.addressTableLookups !== undefined &&
        compiledMessage.addressTableLookups.length > 0
            ? compiledMessage.addressTableLookups
            : [];
    const lookupTableAddresses = lookupTables.map(l => l.lookupTableAddress);

    const fetchedLookupTables =
        lookupTableAddresses.length > 0 ? await fetchLookupTables(lookupTableAddresses, rpc, fetchAccountsConfig) : {};

    return decompileTransaction(compiledTransaction, {
        addressesByLookupTableAddress: fetchedLookupTables,
        lastValidBlockHeight,
    });
}
