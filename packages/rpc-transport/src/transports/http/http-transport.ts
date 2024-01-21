import { ClusterUrl, IRpcTransport, IRpcTransportFromClusterUrl } from '@solana/rpc-types';
import fetchImpl from 'fetch-impl';

import { SolanaHttpError } from './http-transport-errors';
import {
    AllowedHttpRequestHeaders,
    assertIsAllowedHttpRequestHeaders,
    normalizeHeaders,
} from './http-transport-headers';

type Config = Readonly<{
    headers?: AllowedHttpRequestHeaders;
    url: ClusterUrl;
}>;

export function createHttpTransport<TConfig extends Config>({
    headers,
    url,
}: TConfig): IRpcTransportFromClusterUrl<TConfig['url']> {
    if (__DEV__ && headers) {
        assertIsAllowedHttpRequestHeaders(headers);
    }
    const customHeaders = headers && normalizeHeaders(headers);
    return async function makeHttpRequest<TResponse>({
        payload,
        signal,
    }: Parameters<IRpcTransport>[0]): Promise<TResponse> {
        const body = JSON.stringify(payload);
        const requestInfo = {
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
    } as IRpcTransportFromClusterUrl<TConfig['url']>;
}
