import { assertIsAllowedHttpRequestHeaders } from '../http-request-headers';

describe('assertIsAllowedHttpRequestHeader', () => {
    [
        'Accept-Charset',
        'Accept-charset',
        'accept-charset',
        'ACCEPT-CHARSET',
        'Accept-Encoding',
        'Access-Control-Request-Headers',
        'Access-Control-Request-Method',
        'Connection',
        'Content-Length',
        'Cookie',
        'Date',
        'DNT',
        'Expect',
        'Host',
        'Keep-Alive',
        'Origin',
        'Permissions-Policy',
        'Proxy-Anything',
        'Proxy-Authenticate',
        'Proxy-Authorization',
        'Sec-Fetch-Dest',
        'Sec-Fetch-Mode',
        'Sec-Fetch-Site',
        'Sec-Fetch-User',
        'Referer',
        'TE',
        'Trailer',
        'Transfer-Encoding',
        'Upgrade',
        'Via',
    ].forEach(forbiddenHeader => {
        it('throws when called with the forbidden header `' + forbiddenHeader + '`', () => {
            expect(() => {
                assertIsAllowedHttpRequestHeaders({ [forbiddenHeader]: 'value' });
            }).toThrow(/This header is forbidden:/);
        });
    });
    ['Authorization', 'Content-Language', 'Solana-Client'].forEach(allowedHeader => {
        it('does not throw when called with the header `' + allowedHeader + '`', () => {
            expect(() => {
                assertIsAllowedHttpRequestHeaders({ [allowedHeader]: 'value' });
            }).not.toThrow();
        });
    });
});
