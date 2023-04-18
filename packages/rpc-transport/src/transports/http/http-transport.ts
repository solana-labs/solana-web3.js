import { SolanaHttpError } from './http-transport-errors';
import {
    AllowedHttpRequestHeaders,
    assertIsAllowedHttpRequestHeaders,
    normalizeHeaders,
} from './http-transport-headers';
import { IRpcTransport } from '../transport-types';

import fetchImpl from 'fetch-impl';
import type { Agent as NodeHttpAgent } from 'node:http';
import type { Agent as NodeHttpsAgent } from 'node:https';

type Config = Readonly<{
    headers?: AllowedHttpRequestHeaders;
    httpAgentNodeOnly?: NodeHttpAgent | NodeHttpsAgent | ((parsedUrl: URL) => NodeHttpAgent | NodeHttpsAgent);
    url: string;
}>;

export function createHttpTransport({ httpAgentNodeOnly, headers, url }: Config): IRpcTransport {
    if (__DEV__ && headers) {
        assertIsAllowedHttpRequestHeaders(headers);
    }
    const agent = __NODEJS__ ? httpAgentNodeOnly : undefined;
    if (__DEV__ && httpAgentNodeOnly != null) {
        console.warn(
            'createHttpTransport(): The `httpAgentNodeOnly` config you supplied has been ' +
                'ignored; HTTP agents are only usable in Node environments.'
        );
    }
    const customHeaders = headers && normalizeHeaders(headers);
    return async function makeHttpRequest<TResponse>({
        payload,
        signal,
    }: Parameters<IRpcTransport>[0]): Promise<TResponse> {
        const body = JSON.stringify(payload);
        const requestInfo = {
            agent,
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
        const response = await fetchImpl(url, requestInfo);
        if (!response.ok) {
            throw new SolanaHttpError({
                message: response.statusText,
                statusCode: response.status,
            });
        }
        return (await response.json()) as TResponse;
    };
}
