import { RpcTransport } from '@solana/rpc-spec';
import { parseJsonWithBigInts, stringifyJsonWithBigints } from '@solana/rpc-spec-types';
import type Dispatcher from 'undici-types/dispatcher';

import { createHttpTransport } from './http-transport';
import { AllowedHttpRequestHeaders } from './http-transport-headers';
import { isSolanaRequest } from './is-solana-request';

type Config = Readonly<{
    dispatcher_NODE_ONLY?: Dispatcher;
    headers?: AllowedHttpRequestHeaders;
    url: string;
}>;

export function createHttpTransportForSolanaRpc(config: Config): RpcTransport {
    return createHttpTransport({
        ...config,
        fromJson: (rawResponse: string, payload: unknown) =>
            isSolanaRequest(payload) ? parseJsonWithBigInts(rawResponse) : JSON.parse(rawResponse),
        toJson: (payload: unknown) =>
            isSolanaRequest(payload) ? stringifyJsonWithBigints(payload) : JSON.stringify(payload),
    });
}
