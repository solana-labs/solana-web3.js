import { assertIsFixedSize } from '@solana/codecs-core';
import { SOLANA_ERROR__CODECS__INVALID_CONSTANT, SolanaError } from '@solana/errors';

import { getConstantCodec } from '../constant';
import { b } from './__setup__';

describe('getConstantCodec', () => {
    it('encodes the provided constant', () => {
        const codec = getConstantCodec(b('010203'));
        expect(codec.encode(undefined)).toStrictEqual(b('010203'));
    });

    it('decodes undefined when the constant is present', () => {
        const codec = getConstantCodec(b('010203'));
        expect(codec.decode(b('010203'))).toBeUndefined();
    });

    it('pushes the offset forward when writing', () => {
        const codec = getConstantCodec(b('010203'));
        expect(codec.write(undefined, new Uint8Array(10), 3)).toBe(6);
    });

    it('pushes the offset forward when reading', () => {
        const codec = getConstantCodec(b('010203'));
        expect(codec.read(b('ffff01020300'), 2)).toStrictEqual([undefined, 5]);
    });

    it('throws when the decoded bytes do no contain the constant bytes', () => {
        const codec = getConstantCodec(b('010203'));
        expect(() => codec.decode(b('0102ff'))).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_CONSTANT, {
                constant: b('010203'),
                data: b('0102ff'),
                hexConstant: '010203',
                hexData: '0102ff',
                offset: 0,
            }),
        );
    });

    it('returns a fixed size codec of the size of the provided byte array', () => {
        const codec = getConstantCodec(b('010203'));
        assertIsFixedSize(codec);
        expect(codec.fixedSize).toBe(3);
    });
});
