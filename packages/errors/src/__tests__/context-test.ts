import { decodeEncodedContext, encodeContextObject } from '../context';

async function getTestContext() {
    return {
        a: 1n,
        b: '"bar"',
        c: "'baz'",
        d: '!=$&ymbo;s\\',
        e: [1, ["'2a'", '"2b"', '2c'], 3],
        f: Symbol('hi'),
        g: { foo: 'bar' },
        h: new URL('http://anza.xyz'),
        i: ((await crypto.subtle.generateKey('Ed25519', false /* extractable */, ['sign', 'verify'])) as CryptoKeyPair)
            .privateKey,
        j: Object.create(null),
        k: null,
        l: undefined,
        m: "'",
        n: "\\'",
        o: "\\\\'",
        p: '🚀',
        q: 'حب',
        r: 'प्यार',
        s: '爱',
    } as const;
}
const EXPECTED_URL_ENCODED_CONTEXT =
    'a=1n&' +
    'b=%22bar%22&' +
    "c='baz'&" +
    'd=!%3D%24%26ymbo%3Bs%5C&' +
    "e=%5B1%2C%20%5B'2a'%2C%20%222b%22%2C%202c%5D%2C%203%5D&" +
    'f=Symbol(hi)&' +
    'g=%5Bobject%20Object%5D&' +
    'h=http%3A%2F%2Fanza.xyz%2F&' +
    'i=%5Bobject%20CryptoKey%5D&' +
    'j=%5Bobject%20Object%5D&' +
    'k=null&' +
    'l=undefined&' +
    "m='&" +
    "n=%5C'&" +
    "o=%5C%5C'&" +
    'p=%F0%9F%9A%80&' +
    'q=%D8%AD%D8%A8&' +
    'r=%E0%A4%AA%E0%A5%8D%E0%A4%AF%E0%A4%BE%E0%A4%B0&' +
    's=%E7%88%B1';

describe('decodeEncodedContext', () => {
    it('produces the expected context object from a URL-encoded search string', () => {
        const encodedContext = btoa(EXPECTED_URL_ENCODED_CONTEXT);
        expect(decodeEncodedContext(encodedContext)).toStrictEqual({
            a: '1n',
            b: '"bar"',
            c: "'baz'",
            d: '!=$&ymbo;s\\',
            e: '[1, [\'2a\', "2b", 2c], 3]',
            f: 'Symbol(hi)',
            g: '[object Object]',
            h: 'http://anza.xyz/',
            i: '[object CryptoKey]',
            j: '[object Object]',
            k: 'null',
            l: 'undefined',
            m: "'",
            n: "\\'",
            o: "\\\\'",
            p: '🚀',
            q: 'حب',
            r: 'प्यार',
            s: '爱',
        });
    });
});

describe('encodeContextObject', () => {
    let context: object;
    beforeEach(async () => {
        context = await getTestContext();
    });
    it('produces a string with no single quotes in it', () => {
        const encodedContext = encodeContextObject(context);
        expect(encodedContext).not.toContain("'");
    });
    it('produces encoded context that base64 decodes to the expected URL-encoded search string', () => {
        const encodedContext = encodeContextObject(context);
        expect(atob(encodedContext)).toBe(EXPECTED_URL_ENCODED_CONTEXT);
    });
});
