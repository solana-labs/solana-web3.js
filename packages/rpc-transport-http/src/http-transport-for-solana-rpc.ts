import { RpcTransport } from '@solana/rpc-spec';
import type Dispatcher from 'undici-types/dispatcher';

import { createHttpTransport } from './http-transport';
import { AllowedHttpRequestHeaders } from './http-transport-headers';
import { isSolanaRequest } from './is-solana-request';
import { parseJsonWithBigInts } from './parse-json-with-bigints';
import { stringifyJsonWithBigints } from './stringify-json-with-bigints';

type Config = Readonly<{
    dispatcher_NODE_ONLY?: Dispatcher;
    headers?: AllowedHttpRequestHeaders;
    url: string;
}>;

export function createHttpTransportForSolanaRpc(config: Config): RpcTransport {
    return createHttpTransport({
        ...config,
        fromJson: (rawResponse: string, payload: unknown) => {
            if (!isSolanaRequest(payload)) return JSON.parse(rawResponse);
            const response = parseJsonWithBigInts(rawResponse);
            // Error codes are always numbers.
            if (isErrorResponse(response)) {
                return { ...response, error: { ...response.error, code: Number(response.error.code) } };
            }
            return response;
        },
        toJson: (payload: unknown) =>
            isSolanaRequest(payload) ? stringifyJsonWithBigints(payload) : JSON.stringify(payload),
    });
}

function isErrorResponse(value: unknown): value is { error: { code: bigint } } {
    return (
        !!value &&
        typeof value === 'object' &&
        'error' in value &&
        !!value.error &&
        typeof value.error === 'object' &&
        'code' in value.error
    );
}
