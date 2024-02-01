import { Address } from '@solana/addresses';
import {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    Base64EncodedZStdCompressedDataResponse,
    Commitment,
    Rpc,
    U64UnsafeBeyond2Pow53Minus1,
} from '@solana/rpc-types';

import { GetMultipleAccountsApi } from '../getMultipleAccounts';

const rpc = null as unknown as Rpc<GetMultipleAccountsApi>;
const address = 'Joe11111111111111111111111111111' as Address<'Joe11111111111111111111111111111'>;

// Parameters
const params = null as unknown as Parameters<GetMultipleAccountsApi['getMultipleAccounts']>[1];
params satisfies { commitment?: Commitment } | undefined;
params satisfies { dataSlice?: { length: number; offset: number } } | undefined;
params satisfies { encoding?: 'jsonParsed' | 'base58' | 'base64' | 'base64+zstd' } | undefined;
params satisfies { minContextSlot?: bigint } | undefined;

async () => {
    {
        const result = await rpc.getMultipleAccounts([address], { encoding: 'base64' }).send();
        result.value.forEach(account => {
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

    {
        const result = await rpc.getMultipleAccounts([address], { encoding: 'base64+zstd' }).send();
        result.value.forEach(account => {
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

    {
        const result = await rpc.getMultipleAccounts([address], { encoding: 'jsonParsed' }).send();
        result.value.forEach(account => {
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

    {
        const result = await rpc.getMultipleAccounts([address], { encoding: 'base58' }).send();
        result.value.forEach(account => {
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

    {
        const result = await rpc.getMultipleAccounts([address]).send();
        result.value.forEach(account => {
            if (account) {
                const { data } = account;
                data satisfies Base64EncodedDataResponse;
                // @ts-expect-error should not be `base58` bytes
                data satisfies Base58EncodedBytes;
                // @ts-expect-error should not be `base58` data response
                data satisfies Base58EncodedDataResponse;
                // @ts-expect-error should not be `base64+zstd`
                data satisfies Base64EncodedZStdCompressedDataResponse;
            }
        });
    }
};
