import { base58 } from '@metaplex-foundation/umi-serializers';

import { assertIsBlockhash } from '../blockhash';

describe('assertIsBlockhash()', () => {
    it('throws when supplied a non-base58 string', () => {
        expect(() => {
            assertIsBlockhash('not-a-base-58-encoded-string');
        }).toThrow();
    });
    it('throws when the decoded byte array has a length other than 32 bytes', () => {
        expect(() => {
            assertIsBlockhash(
                // 31 bytes [128, ..., 128]
                '2xea9jWJ9eca3dFiefTeSPP85c6qXqunCqL2h2JNffM'
            );
        }).toThrow();
    });
    it('does not throw when supplied a base-58 encoded hash', () => {
        expect(() => {
            assertIsBlockhash('11111111111111111111111111111111');
        }).not.toThrow();
    });
    it('returns undefined when supplied a base-58 encoded hash', () => {
        expect(assertIsBlockhash('11111111111111111111111111111111')).toBeUndefined();
    });
    [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44].forEach(len => {
        it(`attempts to decode input strings of exactly ${len} characters`, () => {
            const decodeMethod = jest.spyOn(base58, 'serialize');
            try {
                assertIsBlockhash('1'.repeat(len));
                // eslint-disable-next-line no-empty
            } catch {}
            expect(decodeMethod).toHaveBeenCalled();
        });
    });
    it('does not attempt to decode too-short input strings', () => {
        const decodeMethod = jest.spyOn(base58, 'serialize');
        try {
            assertIsBlockhash(
                // 31 bytes [0, ..., 0]
                '1111111111111111111111111111111' // 31 characters
            );
            // eslint-disable-next-line no-empty
        } catch {}
        expect(decodeMethod).not.toHaveBeenCalled();
    });
    it('does not attempt to decode too-long input strings', () => {
        const decodeMethod = jest.spyOn(base58, 'serialize');
        try {
            assertIsBlockhash(
                // 33 bytes [0, 255, ..., 255]
                '1JEKNVnkbo3jma5nREBBJCDoXFVeKkD56V3xKrvRmWxFG' // 45 characters
            );
            // eslint-disable-next-line no-empty
        } catch {}
        expect(decodeMethod).not.toHaveBeenCalled();
    });
});
