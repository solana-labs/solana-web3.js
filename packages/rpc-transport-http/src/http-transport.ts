import { SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR, SolanaError } from '@solana/errors';
import { RpcTransport } from '@solana/rpc-spec';
import type Dispatcher from 'undici-types/dispatcher';

import {
    AllowedHttpRequestHeaders,
    assertIsAllowedHttpRequestHeaders,
    normalizeHeaders,
} from './http-transport-headers';

type Config = Readonly<{
    dispatcher_NODE_ONLY?: Dispatcher;
    headers?: AllowedHttpRequestHeaders;
    url: string;
}>;

let didWarnDispatcherWasSuppliedInNonNodeEnvironment = false;
function warnDispatcherWasSuppliedInNonNodeEnvironment() {
    if (didWarnDispatcherWasSuppliedInNonNodeEnvironment) {
        return;
    }
    didWarnDispatcherWasSuppliedInNonNodeEnvironment = true;
    console.warn(
        'You have supplied a `Dispatcher` to `createHttpTransport()`. It has been ignored ' +
            'because Undici dispatchers only work in Node environments. To eliminate this ' +
            'warning, omit the `dispatcher_NODE_ONLY` property from your config when running in ' +
            'a non-Node environment.',
    );
}

export function createHttpTransport(config: Config): RpcTransport {
    if (__DEV__ && !__NODEJS__ && 'dispatcher_NODE_ONLY' in config) {
        warnDispatcherWasSuppliedInNonNodeEnvironment();
    }
    const { headers, url } = config;
    if (__DEV__ && headers) {
        assertIsAllowedHttpRequestHeaders(headers);
    }
    let dispatcherConfig: { dispatcher: Dispatcher | undefined } | undefined;
    if (__NODEJS__ && 'dispatcher_NODE_ONLY' in config) {
        dispatcherConfig = { dispatcher: config.dispatcher_NODE_ONLY };
    }
    const customHeaders = headers && normalizeHeaders(headers);
    return async function makeHttpRequest<TResponse>({
        payload,
        signal,
    }: Parameters<RpcTransport>[0]): Promise<TResponse> {
        const body = JSON.stringify(payload);
        const requestInfo = {
            ...dispatcherConfig,
            body,
            headers: {
                ...customHeaders,
                // Keep these headers lowercase so they will override any user-supplied headers above.
                accept: 'application/json',
                'content-length': body.length.toString(),
                'content-type': 'application/json; charset=utf-8',
            },
            method: 'POST',
            signal,
        };
        const response = await fetch(url, requestInfo);
        if (!response.ok) {
            throw new SolanaError(SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR, {
                message: response.statusText,
                statusCode: response.status,
            });
        }
        return (await response.json()) as TResponse;
    };
}
