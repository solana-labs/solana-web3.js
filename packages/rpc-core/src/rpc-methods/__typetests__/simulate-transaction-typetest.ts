import { Address } from '@solana/addresses';
import {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    Base64EncodedZStdCompressedDataResponse,
    Commitment,
    Rpc,
    Slot,
    U64UnsafeBeyond2Pow53Minus1,
} from '@solana/rpc-types';
import { Base64EncodedWireTransaction } from '@solana/transactions';

import { SimulateTransactionApi } from '../simulateTransaction';

const rpc = null as unknown as Rpc<SimulateTransactionApi>;
const transactionBase58 = null as unknown as Base58EncodedBytes;
const transactionBase64 = null as unknown as Base64EncodedWireTransaction;
const address = 'Joe11111111111111111111111111111' as Address<'Joe11111111111111111111111111111'>;

// Parameters
const params = null as unknown as Parameters<SimulateTransactionApi['simulateTransaction']>[1];
params satisfies
    | {
          accounts?: Readonly<{
              addresses: Address[];
              encoding?: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed' | undefined;
          }>;
      }
    | undefined;
params satisfies { commitment?: Commitment } | undefined;
params satisfies { encoding?: 'base58' | 'base64' } | undefined;
params satisfies { minContextSlot?: Slot } | undefined;
params satisfies { replaceRecentBlockhash?: boolean } | undefined;
params satisfies { sigVerify?: boolean } | undefined;

async () => {
    // `base58` transaction with `base58` accounts
    {
        const result = await rpc
            .simulateTransaction(transactionBase58, { accounts: { addresses: [address], encoding: 'base58' } })
            .send();
        const { accounts } = result.value;
        accounts.forEach(account => {
            if (account) {
                const { data } = account;
                data satisfies Base58EncodedDataResponse;
                // @ts-expect-error should not be `base58` bytes
                data satisfies Base58EncodedBytes;
                // @ts-expect-error should not be `base64`
                data satisfies Base64EncodedDataResponse;
                // @ts-expect-error should not be `base64+zstd`
                data satisfies Base64EncodedZStdCompressedDataResponse;
            }
        });
    }

    // `base58` transaction with `base64` accounts
    {
        const result = await rpc
            .simulateTransaction(transactionBase58, { accounts: { addresses: [address], encoding: 'base64' } })
            .send();
        const { accounts } = result.value;
        accounts.forEach(account => {
            if (account) {
                const { data } = account;
                data satisfies Base64EncodedDataResponse;
                // @ts-expect-error should not be `base58` bytes
                data satisfies Base58EncodedBytes;
                // @ts-expect-error should not be `base58`
                data satisfies Base58EncodedDataResponse;
                // @ts-expect-error should not be `base64+zstd`
                data satisfies Base64EncodedZStdCompressedDataResponse;
            }
        });
    }

    // `base58` transaction with `base64+zstd` accounts
    {
        const result = await rpc
            .simulateTransaction(transactionBase58, { accounts: { addresses: [address], encoding: 'base64+zstd' } })
            .send();
        const { accounts } = result.value;
        accounts.forEach(account => {
            if (account) {
                const { data } = account;
                data satisfies Base64EncodedZStdCompressedDataResponse;
                // @ts-expect-error should not be `base58` bytes
                data satisfies Base58EncodedBytes;
                // @ts-expect-error should not be `base58`
                data satisfies Base58EncodedDataResponse;
                // @ts-expect-error should not be `base64`
                data satisfies Base64EncodedDataResponse;
            }
        });
    }

    // `base58` transaction with `jsonParsed` accounts
    {
        const result = await rpc
            .simulateTransaction(transactionBase58, { accounts: { addresses: [address], encoding: 'jsonParsed' } })
            .send();
        const { accounts } = result.value;
        accounts.forEach(account => {
            if (account) {
                const { data } = account;
                data satisfies
                    | Readonly<{
                          program: string;
                          parsed: {
                              info?: object;
                              type: string;
                          };
                          space: U64UnsafeBeyond2Pow53Minus1;
                      }>
                    | Base64EncodedDataResponse;
                // @ts-expect-error should not be `base58` bytes
                data satisfies Base58EncodedBytes;
                // @ts-expect-error should not be `base58`
                data satisfies Base58EncodedDataResponse;
                // @ts-expect-error should not be `base64+zstd`
                data satisfies Base64EncodedZStdCompressedDataResponse;
                // @ts-expect-error should not be `base64` on its own
                data satisfies Base64EncodedDataResponse;
                // @ts-expect-error should not be `jsonParsed` on its own
                data satisfies Readonly<{
                    program: string;
                    parsed: {
                        info?: object;
                        type: string;
                    };
                    space: U64UnsafeBeyond2Pow53Minus1;
                }>;
            }
        });
    }

    // `base58` transaction with no account configs provided
    {
        const result = await rpc.simulateTransaction(transactionBase58).send();
        result.value.accounts satisfies null;
    }

    // `base64` transaction with `base58` accounts
    {
        const result = await rpc
            .simulateTransaction(transactionBase64, {
                accounts: { addresses: [address], encoding: 'base58' },
                encoding: 'base64',
            })
            .send();
        const { accounts } = result.value;
        accounts.forEach(account => {
            if (account) {
                const { data } = account;
                data satisfies Base58EncodedDataResponse;
                // @ts-expect-error should not be `base58` bytes
                data satisfies Base58EncodedBytes;
                // @ts-expect-error should not be `base64`
                data satisfies Base64EncodedDataResponse;
                // @ts-expect-error should not be `base64+zstd`
                data satisfies Base64EncodedZStdCompressedDataResponse;
            }
        });
    }

    // `base64` transaction with `base64` accounts
    {
        const result = await rpc
            .simulateTransaction(transactionBase64, {
                accounts: { addresses: [address], encoding: 'base64' },
                encoding: 'base64',
            })
            .send();
        const { accounts } = result.value;
        accounts.forEach(account => {
            if (account) {
                const { data } = account;
                data satisfies Base64EncodedDataResponse;
                // @ts-expect-error should not be `base58` bytes
                data satisfies Base58EncodedBytes;
                // @ts-expect-error should not be `base58`
                data satisfies Base58EncodedDataResponse;
                // @ts-expect-error should not be `base64+zstd`
                data satisfies Base64EncodedZStdCompressedDataResponse;
            }
        });
    }

    // `base64` transaction with `base64+zstd` accounts
    {
        const result = await rpc
            .simulateTransaction(transactionBase64, {
                accounts: { addresses: [address], encoding: 'base64+zstd' },
                encoding: 'base64',
            })
            .send();
        const { accounts } = result.value;
        accounts.forEach(account => {
            if (account) {
                const { data } = account;
                data satisfies Base64EncodedZStdCompressedDataResponse;
                // @ts-expect-error should not be `base58` bytes
                data satisfies Base58EncodedBytes;
                // @ts-expect-error should not be `base58`
                data satisfies Base58EncodedDataResponse;
                // @ts-expect-error should not be `base64`
                data satisfies Base64EncodedDataResponse;
            }
        });
    }

    // `base64` transaction with `jsonParsed` accounts
    {
        const result = await rpc
            .simulateTransaction(transactionBase64, {
                accounts: { addresses: [address], encoding: 'jsonParsed' },
                encoding: 'base64',
            })
            .send();
        const { accounts } = result.value;
        accounts.forEach(account => {
            if (account) {
                const { data } = account;
                data satisfies
                    | Readonly<{
                          program: string;
                          parsed: {
                              info?: object;
                              type: string;
                          };
                          space: U64UnsafeBeyond2Pow53Minus1;
                      }>
                    | Base64EncodedDataResponse;
                // @ts-expect-error should not be `base58` bytes
                data satisfies Base58EncodedBytes;
                // @ts-expect-error should not be `base58`
                data satisfies Base58EncodedDataResponse;
                // @ts-expect-error should not be `base64+zstd`
                data satisfies Base64EncodedZStdCompressedDataResponse;
                // @ts-expect-error should not be `base64` on its own
                data satisfies Base64EncodedDataResponse;
                // @ts-expect-error should not be `jsonParsed` on its own
                data satisfies Readonly<{
                    program: string;
                    parsed: {
                        info?: object;
                        type: string;
                    };
                    space: U64UnsafeBeyond2Pow53Minus1;
                }>;
            }
        });
    }

    // `base64` transaction with no account configs provided
    {
        const result = await rpc.simulateTransaction(transactionBase64, { encoding: 'base64' }).send();
        result.value.accounts satisfies null;
    }

    // @ts-expect-error can't mix encodings
    rpc.simulateTransaction(transactionBase58, { encoding: 'base64' });
    // @ts-expect-error can't mix encodings
    rpc.simulateTransaction(transactionBase64, { encoding: 'base58' });
};
