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

import { GetAccountInfoApi } from '../getAccountInfo';

const rpc = null as unknown as Rpc<GetAccountInfoApi>;
const address = 'Joe11111111111111111111111111111' as Address<'Joe11111111111111111111111111111'>;

// Parameters
const params = null as unknown as Parameters<GetAccountInfoApi['getAccountInfo']>[1];
params satisfies { commitment?: Commitment } | undefined;
params satisfies { dataSlice?: { length: number; offset: number } } | undefined;
params satisfies { encoding?: 'jsonParsed' | 'base58' | 'base64' | 'base64+zstd' } | undefined;
params satisfies { minContextSlot?: bigint } | undefined;

async () => {
    {
        const result = await rpc.getAccountInfo(address, { encoding: 'base64' }).send();
        if (result.value) {
            const { data } = result.value;
            data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `base58` bytes
            data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58`
            data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            data satisfies Base64EncodedZStdCompressedDataResponse;
        }
    }

    {
        const result = await rpc.getAccountInfo(address, { encoding: 'base64+zstd' }).send();
        if (result.value) {
            const { data } = result.value;
            data satisfies Base64EncodedZStdCompressedDataResponse;
            // @ts-expect-error should not be `base58` bytes
            data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58`
            data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64`
            data satisfies Base64EncodedDataResponse;
        }
    }

    {
        const result = await rpc.getAccountInfo(address, { encoding: 'jsonParsed' }).send();
        if (result.value) {
            const { data } = result.value;
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
    }

    {
        const result = await rpc.getAccountInfo(address, { encoding: 'base58' }).send();
        if (result.value) {
            const { data } = result.value;
            data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base58` bytes
            data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base64`
            data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            data satisfies Base64EncodedZStdCompressedDataResponse;
        }
    }

    {
        const result = await rpc.getAccountInfo(address).send();
        if (result.value) {
            const { data } = result.value;
            data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58` data response
            data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64`
            data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            data satisfies Base64EncodedZStdCompressedDataResponse;
        }
    }
};
