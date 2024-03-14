import { SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH, SolanaError } from '@solana/errors';

import { FixedSizeCodec } from '../codec';
import { resizeCodec } from '../resize-codec';
import { getMockCodec } from './__setup__';

describe('resizeCodec', () => {
    it('resizes fixed-size codecs', () => {
        const mockCodec = getMockCodec({ size: 42 }) as FixedSizeCodec<unknown, 42>;
        expect(resizeCodec(mockCodec, size => size + 1).fixedSize).toBe(43);
        expect(resizeCodec(mockCodec, size => size * 2).fixedSize).toBe(84);
        expect(resizeCodec(mockCodec, () => 0).fixedSize).toBe(0);
    });

    it('resizes variable-size codecs', () => {
        const mockCodec = getMockCodec();
        mockCodec.getSizeFromValue.mockReturnValue(42);
        expect(resizeCodec(mockCodec, size => size + 1).getSizeFromValue(null)).toBe(43);
        expect(resizeCodec(mockCodec, size => size * 2).getSizeFromValue(null)).toBe(84);
        expect(resizeCodec(mockCodec, () => 0).getSizeFromValue(null)).toBe(0);
    });

    it('throws when fixed-size codecs have negative sizes', () => {
        const mockCodec = getMockCodec({ size: 42 }) as FixedSizeCodec<unknown, 42>;
        expect(() => resizeCodec(mockCodec, size => size - 100).fixedSize).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH, {
                bytesLength: -58,
                codecDescription: 'resizeEncoder',
            }),
        );
    });

    it('throws when variable-size codecs have negative sizes', () => {
        const mockCodec = getMockCodec();
        mockCodec.getSizeFromValue.mockReturnValue(42);
        expect(() => resizeCodec(mockCodec, size => size - 100).getSizeFromValue(null)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH, {
                bytesLength: -58,
                codecDescription: 'resizeEncoder',
            }),
        );
    });
});
