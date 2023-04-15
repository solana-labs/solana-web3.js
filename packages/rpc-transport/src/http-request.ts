import { SolanaHttpError } from './http-request-errors';

import fetchImpl from 'fetch-impl';

type Config = Readonly<{
    abortSignal?: AbortSignal;
    payload: unknown;
    url: string;
}>;

export async function makeHttpRequest<TResponse>({ abortSignal, payload, url }: Config): Promise<TResponse> {
    const body = JSON.stringify(payload);
    const requestInfo = {
        body,
        headers: {
            Accept: 'application/json',
            'Content-Length': body.length.toString(),
            'Content-Type': 'application/json; charset=utf-8',
        },
        method: 'POST',
        signal: abortSignal,
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
