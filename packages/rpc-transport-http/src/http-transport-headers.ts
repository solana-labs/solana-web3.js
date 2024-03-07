import { SOLANA_ERROR__RPC__TRANSPORT_HTTP_HEADER_FORBIDDEN, SolanaError } from '@solana/errors';

export type AllowedHttpRequestHeaders = Readonly<
    {
        // Someone can still sneak a forbidden header past Typescript if they do something like
        // fOo-BaR, but at that point they deserve the runtime failure.
        [K in DisallowedHeaders | ForbiddenHeaders as
            | Capitalize<Lowercase<K>> // `Foo-bar`
            | K // `Foo-Bar`
            | Lowercase<K> // `foo-bar`
            | Uncapitalize<K> // `foo-Bar`
            // `FOO-BAR`
            | Uppercase<K>]?: never;
    } & { [headerName: string]: string }
>;
// These are headers that we simply don't allow the developer to override because they're
// fundamental to the operation of the JSON-RPC transport.
type DisallowedHeaders = 'Accept' | 'Content-Length' | 'Content-Type' | 'Solana-Client';
type ForbiddenHeaders =
    | 'Accept-Charset'
    | 'Accept-Encoding'
    | 'Access-Control-Request-Headers'
    | 'Access-Control-Request-Method'
    | 'Connection'
    | 'Content-Length'
    | 'Cookie'
    | 'Date'
    | 'DNT'
    | 'Expect'
    | 'Host'
    | 'Keep-Alive'
    | 'Origin'
    | 'Permissions-Policy'
    | 'Referer'
    | 'TE'
    | 'Trailer'
    | 'Transfer-Encoding'
    | 'Upgrade'
    | 'Via'
    | `Proxy-${string}`
    | `Sec-${string}`;

// These are headers which are fundamental to the JSON-RPC transport, and must not be modified.
const DISALLOWED_HEADERS: Record<string, boolean> = {
    accept: true,
    'content-length': true,
    'content-type': true,
};
// https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name
const FORBIDDEN_HEADERS: Record<string, boolean> = {
    'accept-charset': true,
    'accept-encoding': true,
    'access-control-request-headers': true,
    'access-control-request-method': true,
    connection: true,
    'content-length': true,
    cookie: true,
    date: true,
    dnt: true,
    expect: true,
    host: true,
    'keep-alive': true,
    origin: true,
    'permissions-policy': true,
    // Prefix matching is implemented in code, below.
    // 'proxy-': true,
    // 'sec-': true,
    referer: true,
    te: true,
    trailer: true,
    'transfer-encoding': true,
    upgrade: true,
    via: true,
};

export function assertIsAllowedHttpRequestHeaders(
    headers: Record<string, string>,
): asserts headers is AllowedHttpRequestHeaders {
    const badHeaders = Object.keys(headers).filter(headerName => {
        const lowercaseHeaderName = headerName.toLowerCase();
        return (
            DISALLOWED_HEADERS[headerName.toLowerCase()] === true ||
            FORBIDDEN_HEADERS[headerName.toLowerCase()] === true ||
            lowercaseHeaderName.startsWith('proxy-') ||
            lowercaseHeaderName.startsWith('sec-')
        );
    });
    if (badHeaders.length > 0) {
        throw new SolanaError(SOLANA_ERROR__RPC__TRANSPORT_HTTP_HEADER_FORBIDDEN, {
            headers: badHeaders,
        });
    }
}

/**
 * Lowercasing header names makes it easier to override user-supplied headers, such as those defined
 * in the `DisallowedHeaders` type.
 */
export function normalizeHeaders<T extends Record<string, string>>(
    headers: T,
): { [K in string & keyof T as Lowercase<K>]: T[K] } {
    const out: Record<string, string> = {};
    for (const headerName in headers) {
        out[headerName.toLowerCase()] = headers[headerName];
    }
    return out as { [K in string & keyof T as Lowercase<K>]: T[K] };
}
