import {
    Endian,
    getU8Codec,
    getU8Decoder,
    getU8Encoder,
    getU16Codec,
    getU16Decoder,
    getU16Encoder,
    getU64Codec,
    getU64Decoder,
    getU64Encoder,
} from '@solana/codecs-numbers';
import { SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE, SolanaError } from '@solana/errors';

import {
    assertIsLamports,
    getLamportsCodec,
    getLamportsCodecFromCodec,
    getLamportsDecoder,
    getLamportsDecoderFromDecoder,
    getLamportsEncoder,
    getLamportsEncoderFromEncoder,
    lamports,
} from '../lamports';

describe('assertIsLamports()', () => {
    it('throws when supplied a negative number', () => {
        expect(() => {
            assertIsLamports(-1n);
        }).toThrow(new SolanaError(SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE));
        expect(() => {
            assertIsLamports(-1000n);
        }).toThrow(new SolanaError(SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE));
    });
    it('throws when supplied a too large number', () => {
        expect(() => {
            assertIsLamports(2n ** 64n);
        }).toThrow(new SolanaError(SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE));
    });
    it('does not throw when supplied zero lamports', () => {
        expect(() => {
            assertIsLamports(0n);
        }).not.toThrow();
    });
    it('does not throw when supplied a valid non-zero number of lamports', () => {
        expect(() => {
            assertIsLamports(1_000_000_000n);
        }).not.toThrow();
    });
    it('does not throw when supplied the max valid number of lamports', () => {
        expect(() => {
            assertIsLamports(2n ** 64n - 1n);
        }).not.toThrow();
    });
});

describe('getLamportsEncoder', () => {
    it('encodes a lamports value using the default u64 encoder', () => {
        const lamportsValue = lamports(1_000_000_000n);
        const encoder = getLamportsEncoder();
        const buffer = encoder.encode(lamportsValue);
        expect(buffer).toStrictEqual(new Uint8Array([0, 202, 154, 59, 0, 0, 0, 0]));
    });

    it('has a fixed size of 8', () => {
        const encoder = getLamportsEncoder();
        expect(encoder.fixedSize).toBe(8);
    });
});

describe('getLamportsEncoderFromEncoder', () => {
    it('encodes a lamports value using a passed u8 encoder', () => {
        const lamportsValue = lamports(100n);
        const encoder = getLamportsEncoderFromEncoder(getU8Encoder());
        const buffer = encoder.encode(lamportsValue);
        expect(buffer).toStrictEqual(new Uint8Array([100]));
    });
    it('encodes a lamports value using a passed big-endian u16 encoder', () => {
        const lamportsValue = lamports(100n);
        const encoder = getLamportsEncoderFromEncoder(getU16Encoder({ endian: Endian.Big }));
        const buffer = encoder.encode(lamportsValue);
        expect(buffer).toStrictEqual(new Uint8Array([0, 100]));
    });
    it('encodes a lamports value using a passed u64 encoder', () => {
        const lamportsValue = lamports(BigInt('0xffffffffffffffff'));
        const encoder = getLamportsEncoderFromEncoder(getU64Encoder());
        const buffer = encoder.encode(lamportsValue);
        expect(buffer).toStrictEqual(new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]));
    });
    it('has a fixed size of 1 for a passed u8 encoder', () => {
        const encoder = getLamportsEncoderFromEncoder(getU8Encoder());
        expect(encoder.fixedSize).toBe(1);
    });
});

describe('getLamportsDecoder', () => {
    it('decodes an 8-byte buffer into a lamports value using the default u64 decoder', () => {
        const buffer = new Uint8Array([0, 29, 50, 247, 69, 0, 0, 0]);
        const decoder = getLamportsDecoder();
        const lamportsValue = decoder.decode(buffer);
        expect(lamportsValue).toStrictEqual(lamports(300_500_000_000n));
    });
    it('has a fixed size of 8', () => {
        const decoder = getLamportsDecoder();
        expect(decoder.fixedSize).toBe(8);
    });
});

describe('getLamportsDecoderFromDecoder', () => {
    it('decodes a 1-byte buffer into a lamports value using a passed u8 decoder', () => {
        const buffer = new Uint8Array([100]);
        const decoder = getLamportsDecoderFromDecoder(getU8Decoder());
        const lamportsValue = decoder.decode(buffer);
        expect(lamportsValue).toStrictEqual(lamports(100n));
    });
    it('decodes a 2-byte buffer into a lamports value using a passed big-endian u16 decoder', () => {
        const buffer = new Uint8Array([0, 100]);
        const decoder = getLamportsDecoderFromDecoder(getU16Decoder({ endian: Endian.Big }));
        const lamportsValue = decoder.decode(buffer);
        expect(lamportsValue).toStrictEqual(lamports(100n));
    });
    it('decodes an 8-byte buffer into a lamports value using a passed u64 decoder', () => {
        const buffer = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]);
        const decoder = getLamportsDecoderFromDecoder(getU64Decoder());
        const lamportsValue = decoder.decode(buffer);
        expect(lamportsValue).toStrictEqual(lamports(BigInt('0xffffffffffffffff')));
    });
    it('has a fixed size of 1 for a passed u8 decoder', () => {
        const decoder = getLamportsDecoderFromDecoder(getU8Decoder());
        expect(decoder.fixedSize).toBe(1);
    });
});

describe('getLamportsCodec', () => {
    it('encodes a lamports value using the default u64 encoder', () => {
        const lamportsValue = lamports(1_000_000_000n);
        const codec = getLamportsCodec();
        const buffer = codec.encode(lamportsValue);
        expect(buffer).toStrictEqual(new Uint8Array([0, 202, 154, 59, 0, 0, 0, 0]));
    });
    it('decodes an 8-byte buffer into a lamports value using the default u64 decoder', () => {
        const buffer = new Uint8Array([0, 29, 50, 247, 69, 0, 0, 0]);
        const codec = getLamportsCodec();
        const lamportsValue = codec.decode(buffer);
        expect(lamportsValue).toStrictEqual(lamports(300_500_000_000n));
    });
    it('has a fixed size of 8', () => {
        const codec = getLamportsCodec();
        expect(codec.fixedSize).toBe(8);
    });
});

describe('getLamportsCodecFromCodec', () => {
    it('encodes a lamports value using a passed u8 codec', () => {
        const lamportsValue = lamports(100n);
        const codec = getLamportsCodecFromCodec(getU8Codec());
        const buffer = codec.encode(lamportsValue);
        expect(buffer).toStrictEqual(new Uint8Array([100]));
    });
    it('encodes a lamports value using a passed big-endian u16 codec', () => {
        const lamportsValue = lamports(100n);
        const codec = getLamportsCodecFromCodec(getU16Codec({ endian: Endian.Big }));
        const buffer = codec.encode(lamportsValue);
        expect(buffer).toStrictEqual(new Uint8Array([0, 100]));
    });
    it('encodes a lamports value using a passed u64 codec', () => {
        const lamportsValue = lamports(BigInt('0xffffffffffffffff'));
        const codec = getLamportsCodecFromCodec(getU64Codec());
        const buffer = codec.encode(lamportsValue);
        expect(buffer).toStrictEqual(new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]));
    });

    it('decodes a 1-byte buffer into a lamports value using a passed u8 codec', () => {
        const buffer = new Uint8Array([100]);
        const codec = getLamportsCodecFromCodec(getU8Codec());
        const lamportsValue = codec.decode(buffer);
        expect(lamportsValue).toStrictEqual(lamports(100n));
    });
    it('decodes a 2-byte buffer into a lamports value using a passed big-endian u16 codec', () => {
        const buffer = new Uint8Array([0, 100]);
        const codec = getLamportsCodecFromCodec(getU16Codec({ endian: Endian.Big }));
        const lamportsValue = codec.decode(buffer);
        expect(lamportsValue).toStrictEqual(lamports(100n));
    });
    it('decodes an 8-byte buffer into a lamports value using a passed u64 codec', () => {
        const buffer = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]);
        const codec = getLamportsCodecFromCodec(getU64Codec());
        const lamportsValue = codec.decode(buffer);
        expect(lamportsValue).toStrictEqual(lamports(BigInt('0xffffffffffffffff')));
    });
    it('has a fixed size of 1 for a passed u8 codec', () => {
        const decoder = getLamportsCodecFromCodec(getU8Codec());
        expect(decoder.fixedSize).toBe(1);
    });
});
