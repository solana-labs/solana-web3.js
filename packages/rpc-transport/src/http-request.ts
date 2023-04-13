import { SolanaHttpError } from './http-request-errors';

import fetchImpl from 'fetch-impl';

type Config = Readonly<{
    payload: unknown;
    url: string;
}>;

export async function makeHttpRequest<TResponse>({ payload, url }: Config): Promise<TResponse> {
    const requestInfo = {
        body: JSON.stringify(payload),
        headers: {
            'Content-type': 'application/json',
        },
        method: 'POST',
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
