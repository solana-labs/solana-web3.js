import { SolanaHttpError } from './http-request-errors';
import { AllowedHttpRequestHeaders, normalizeHeaders } from './http-request-headers';

import fetchImpl from 'fetch-impl';

type Config = Readonly<{
    headers?: AllowedHttpRequestHeaders;
    payload: unknown;
    signal?: AbortSignal;
    url: string;
}>;

export async function makeHttpRequest<TResponse>({ headers, payload, signal, url }: Config): Promise<TResponse> {
    const body = JSON.stringify(payload);
    const requestInfo = {
        body,
        headers: {
            ...(headers && (normalizeHeaders(headers) as Record<string, string>)),
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
}
