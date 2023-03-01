import bs58 from 'bs58';
import { assertIsBase58EncodedAddress } from '../base58';

describe('base58', () => {
    describe('assertIsBase58EncodedAddress()', () => {
        it('throws when supplied a non-base58 string', () => {
            expect(() => {
                assertIsBase58EncodedAddress('not-a-base-58-encoded-string');
            }).toThrow();
        });
        it('throws when the decoded byte array has a length other than 32 bytes', () => {
            expect(() => {
                assertIsBase58EncodedAddress(
                    // 31 bytes [128, ..., 128]
                    '2xea9jWJ9eca3dFiefTeSPP85c6qXqunCqL2h2JNffM'
                );
            }).toThrow();
        });
        it('does not throw when supplied a base-58 encoded address', () => {
            expect(() => {
                assertIsBase58EncodedAddress('11111111111111111111111111111111');
            }).not.toThrow();
        });
        it('returns undefined when supplied a base-58 encoded address', () => {
            expect(assertIsBase58EncodedAddress('11111111111111111111111111111111')).toBeUndefined();
        });
        [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44].forEach(len => {
            it(`attempts to decode input strings of exactly ${len} characters`, () => {
                const decodeMethod = jest.spyOn(bs58, 'decode');
                try {
                    assertIsBase58EncodedAddress('1'.repeat(len));
                    // eslint-disable-next-line no-empty
                } catch {}
                expect(decodeMethod).toHaveBeenCalled();
            });
        });
        it('does not attempt to decode too-short input strings', () => {
            const decodeMethod = jest.spyOn(bs58, 'decode');
            try {
                assertIsBase58EncodedAddress(
                    // 31 bytes [0, ..., 0]
                    '1111111111111111111111111111111' // 31 characters
                );
                // eslint-disable-next-line no-empty
            } catch {}
            expect(decodeMethod).not.toHaveBeenCalled();
        });
        it('does not attempt to decode too-long input strings', () => {
            const decodeMethod = jest.spyOn(bs58, 'decode');
            try {
                assertIsBase58EncodedAddress(
                    // 33 bytes [0, 255, ..., 255]
                    '1JEKNVnkbo3jma5nREBBJCDoXFVeKkD56V3xKrvRmWxFG' // 45 characters
                );
                // eslint-disable-next-line no-empty
            } catch {}
            expect(decodeMethod).not.toHaveBeenCalled();
        });
    });
});
