import fetchImplBrowser from '@solana/fetch-impl-browser';
import { SolanaHttpError } from './http-request-errors';

import fetchImplNode from 'node-fetch';

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
    let response;
    if (__BROWSER__ || __REACTNATIVE__) {
        response = await fetchImplBrowser(url, requestInfo);
    } else {
        response = await fetchImplNode(url, requestInfo);
    }
    if (!response.ok) {
        throw new SolanaHttpError({
            message: response.statusText,
            statusCode: response.status,
        });
    }
    return await response.json();
}
