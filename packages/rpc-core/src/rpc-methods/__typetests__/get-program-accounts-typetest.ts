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

import { GetProgramAccountsDatasizeFilter, GetProgramAccountsMemcmpFilter } from '../common';
import { GetProgramAccountsApi } from '../getProgramAccounts';
import { assertNotAProperty } from './common';

const rpc = null as unknown as Rpc<GetProgramAccountsApi>;
const programAddress = 'JoeProgram11111111111111111111111' as Address<'JoeProgram1111111111111111111111'>;

// Parameters
const params = null as unknown as Parameters<GetProgramAccountsApi['getProgramAccounts']>[1];
params satisfies { commitment?: Commitment } | undefined;
params satisfies { dataSlice?: { length: number; offset: number } } | undefined;
params satisfies { filters?: (GetProgramAccountsMemcmpFilter | GetProgramAccountsDatasizeFilter)[] } | undefined;
params satisfies { encoding?: 'jsonParsed' | 'base58' | 'base64' | 'base64+zstd' } | undefined;
params satisfies { minContextSlot?: bigint } | undefined;
params satisfies { withContext?: boolean } | undefined;

async () => {
    // `base64` with context
    {
        const result = await rpc.getProgramAccounts(programAddress, { encoding: 'base64', withContext: true }).send();
        result.context.slot satisfies bigint;
        result.value.forEach(a => {
            a.account.data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `base58` bytes
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58`
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
        });
    }

    // `base64` without context
    {
        const result = await rpc.getProgramAccounts(programAddress, { encoding: 'base64' }).send();
        assertNotAProperty(result, 'context');
        result.forEach(a => {
            a.account.data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `base58` bytes
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58`
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
        });
    }

    // `base64` without context (explicit)
    {
        const result = await rpc.getProgramAccounts(programAddress, { encoding: 'base64', withContext: false }).send();
        assertNotAProperty(result, 'context');
        result.forEach(a => {
            a.account.data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `base58` bytes
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58`
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
        });
    }

    // `base64+zstd` with context
    {
        const result = await rpc
            .getProgramAccounts(programAddress, { encoding: 'base64+zstd', withContext: true })
            .send();
        result.context.slot satisfies bigint;
        result.value.forEach(a => {
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
            // @ts-expect-error should not be `base58` bytes
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58`
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64`
            a.account.data satisfies Base64EncodedDataResponse;
        });
    }

    // `base64+zstd` without context
    {
        const result = await rpc.getProgramAccounts(programAddress, { encoding: 'base64+zstd' }).send();
        assertNotAProperty(result, 'context');
        result.forEach(a => {
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
            // @ts-expect-error should not be `base58` bytes
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58`
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64`
            a.account.data satisfies Base64EncodedDataResponse;
        });
    }

    // `base64+zstd` without context (explicit)
    {
        const result = await rpc
            .getProgramAccounts(programAddress, { encoding: 'base64+zstd', withContext: false })
            .send();
        assertNotAProperty(result, 'context');
        result.forEach(a => {
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
            // @ts-expect-error should not be `base58` bytes
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58`
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64`
            a.account.data satisfies Base64EncodedDataResponse;
        });
    }

    // `jsonParsed` with context
    {
        const result = await rpc
            .getProgramAccounts(programAddress, { encoding: 'jsonParsed', withContext: true })
            .send();
        result.context.slot satisfies bigint;
        result.value.forEach(a => {
            a.account.data satisfies
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
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58`
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
            // @ts-expect-error should not be `base64` on its own
            a.account.data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `jsonParsed` on its own
            a.account.data satisfies Readonly<{
                program: string;
                parsed: {
                    info?: object;
                    type: string;
                };
                space: U64UnsafeBeyond2Pow53Minus1;
            }>;
        });
    }

    // `jsonParsed` without context
    {
        const result = await rpc.getProgramAccounts(programAddress, { encoding: 'jsonParsed' }).send();
        assertNotAProperty(result, 'context');
        result.forEach(a => {
            a.account.data satisfies
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
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58`
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
            // @ts-expect-error should not be `base64` on its own
            a.account.data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `jsonParsed` on its own
            a.account.data satisfies Readonly<{
                program: string;
                parsed: {
                    info?: object;
                    type: string;
                };
                space: U64UnsafeBeyond2Pow53Minus1;
            }>;
        });
    }

    // `jsonParsed` without context (explicit)
    {
        const result = await rpc
            .getProgramAccounts(programAddress, { encoding: 'jsonParsed', withContext: false })
            .send();
        assertNotAProperty(result, 'context');
        result.forEach(a => {
            a.account.data satisfies
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
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58`
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
            // @ts-expect-error should not be `base64` on its own
            a.account.data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `jsonParsed` on its own
            a.account.data satisfies Readonly<{
                program: string;
                parsed: {
                    info?: object;
                    type: string;
                };
                space: U64UnsafeBeyond2Pow53Minus1;
            }>;
        });
    }

    // `base58` with context
    {
        const result = await rpc.getProgramAccounts(programAddress, { encoding: 'base58', withContext: true }).send();
        result.context.slot satisfies bigint;
        result.value.forEach(a => {
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base58` bytes
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base64`
            a.account.data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
        });
    }

    // `base58` without context
    {
        const result = await rpc.getProgramAccounts(programAddress, { encoding: 'base58' }).send();
        assertNotAProperty(result, 'context');
        result.forEach(a => {
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base58` bytes
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base64`
            a.account.data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
        });
    }

    // `base58` without context (explicit)
    {
        const result = await rpc.getProgramAccounts(programAddress, { encoding: 'base58', withContext: false }).send();
        assertNotAProperty(result, 'context');
        result.forEach(a => {
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base58` bytes
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base64`
            a.account.data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
        });
    }

    // No encoding with context
    {
        const result = await rpc.getProgramAccounts(programAddress, { withContext: true }).send();
        result.context.slot satisfies bigint;
        result.value.forEach(a => {
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58` data response
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64`
            a.account.data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
        });
    }

    // No encoding without context
    {
        const result = await rpc.getProgramAccounts(programAddress).send();
        assertNotAProperty(result, 'context');
        result.forEach(a => {
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58` data response
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64`
            a.account.data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
        });
    }

    // No encoding without context (explicit)
    {
        const result = await rpc.getProgramAccounts(programAddress, { withContext: false }).send();
        assertNotAProperty(result, 'context');
        result.forEach(a => {
            a.account.data satisfies Base58EncodedBytes;
            // @ts-expect-error should not be `base58` data response
            a.account.data satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64`
            a.account.data satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `base64+zstd`
            a.account.data satisfies Base64EncodedZStdCompressedDataResponse;
        });
    }
};
