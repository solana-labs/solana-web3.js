import {
    SOLANA_ERROR__CODECS__ENCODED_BYTES_MUST_NOT_INCLUDE_SENTINEL,
    SOLANA_ERROR__CODECS__SENTINEL_MISSING_IN_DECODED_BYTES,
    SolanaError,
} from '@solana/errors';

import { addCodecSentinel } from '../add-codec-sentinel';
import { b, getMockCodec } from './__setup__';

describe('addCodecSentinel', () => {
    it('encodes the sentinel after the main content', () => {
        const mockCodec = getMockCodec();
        mockCodec.getSizeFromValue.mockReturnValue(10);
        mockCodec.write.mockImplementation((_, bytes, offset) => {
            bytes.set(b('68656c6c6f776f726c64'), offset);
            return offset + 10;
        });
        const codec = addCodecSentinel(mockCodec, b('ff'));

        expect(codec.encode('helloworld')).toStrictEqual(b('68656c6c6f776f726c64ff'));
        expect(mockCodec.write).toHaveBeenCalledWith('helloworld', expect.any(Uint8Array), 0);
    });

    it('decodes until the first occurence of the sentinel is found', () => {
        const mockCodec = getMockCodec();
        mockCodec.read.mockReturnValue(['helloworld', 10]);
        const codec = addCodecSentinel(mockCodec, b('ff'));

        expect(codec.decode(b('68656c6c6f776f726c64ff0000'))).toBe('helloworld');
        expect(mockCodec.read).toHaveBeenCalledWith(b('68656c6c6f776f726c64'), 0);
    });

    it('fails if the encoded bytes contain the sentinel', () => {
        const mockCodec = getMockCodec();
        mockCodec.getSizeFromValue.mockReturnValue(10);
        mockCodec.write.mockImplementation((_, bytes, offset) => {
            bytes.set(b('68656c6c6f776f726cff'), offset);
            return offset + 10;
        });
        const codec = addCodecSentinel(mockCodec, b('ff'));

        expect(() => codec.encode('helloworld')).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__ENCODED_BYTES_MUST_NOT_INCLUDE_SENTINEL, {
                encodedBytes: b('68656c6c6f776f726cff'),
                hexEncodedBytes: '68656c6c6f776f726cff',
                hexSentinel: 'ff',
                sentinel: b('ff'),
            }),
        );
    });

    it('fails if the decoded bytes do not contain the sentinel', () => {
        const mockCodec = getMockCodec();
        const codec = addCodecSentinel(mockCodec, b('ff'));

        expect(() => codec.decode(b('68656c6c6f776f726c64000000'))).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__SENTINEL_MISSING_IN_DECODED_BYTES, {
                decodedBytes: b('68656c6c6f776f726c64000000'),
                hexDecodedBytes: '68656c6c6f776f726c64000000',
                hexSentinel: 'ff',
                sentinel: b('ff'),
            }),
        );
    });

    it('returns the correct fixed size', () => {
        const mockCodec = getMockCodec({ size: 10 });
        const codec = addCodecSentinel(mockCodec, b('ffff'));
        expect(codec.fixedSize).toBe(12);
    });

    it('returns the correct variable size', () => {
        const mockCodec = getMockCodec();
        mockCodec.getSizeFromValue.mockReturnValueOnce(10);
        const codec = addCodecSentinel(mockCodec, b('ffff'));
        expect(codec.getSizeFromValue('helloworld')).toBe(12);
    });
});
