import { addCodecSizePrefix } from '../add-codec-size-prefix';
import { assertIsFixedSize, assertIsVariableSize, Codec } from '../codec';
import { b, getMockCodec } from './__setup__';

describe('addCodecSizePrefix', () => {
    it('encodes the byte length before the content', () => {
        const numberCodec = getMockCodec({ size: 4 });
        const contentCodec = getMockCodec({ size: 10 });
        const prefixedCodec = addCodecSizePrefix(contentCodec, numberCodec as Codec<number>);

        prefixedCodec.encode('helloworld');
        expect(numberCodec.write).toHaveBeenCalledWith(10, expect.any(Uint8Array), 0);
        expect(contentCodec.write).toHaveBeenCalledWith('helloworld', expect.any(Uint8Array), 0);
    });

    it('decodes the byte length before the reading the content', () => {
        const numberCodec = getMockCodec({ size: 4 });
        numberCodec.read.mockReturnValue([10, 4]);
        const contentCodec = getMockCodec({ size: 10 });
        const prefixedCodec = addCodecSizePrefix(contentCodec, numberCodec as Codec<number>);

        prefixedCodec.decode(b('0a00000068656c6c6f776f726c64'));
        expect(numberCodec.read).toHaveBeenCalledWith(b('0a00000068656c6c6f776f726c64'), 0);
        expect(contentCodec.read).toHaveBeenCalledWith(b('68656c6c6f776f726c64'), 0);
    });

    it('lets the size codec fail if the byte length overflows the size codec', () => {
        const numberCodec = getMockCodec({ size: 1 });
        const overflowError = new Error('overflow');
        numberCodec.write.mockImplementation((value: number) => {
            // eslint-disable-next-line jest/no-conditional-in-test
            if (value > 255) throw overflowError;
        });
        const contentCodec = getMockCodec({ size: 256 });
        const prefixedCodec = addCodecSizePrefix(contentCodec, numberCodec as Codec<number>);
        expect(() => prefixedCodec.encode(null)).toThrow(overflowError);
    });

    it('returns the correct fixed size', () => {
        const numberCodec = getMockCodec({ size: 4 });
        const contentCodec = getMockCodec({ size: 10 });
        const prefixedCodec = addCodecSizePrefix(contentCodec, numberCodec as Codec<number>);
        assertIsFixedSize(prefixedCodec);
        expect(prefixedCodec.fixedSize).toBe(14);
    });

    it('returns the correct variable size', () => {
        const numberCodec = getMockCodec({ size: 4 });
        const contentCodec = getMockCodec();
        contentCodec.getSizeFromValue.mockReturnValueOnce(10);
        const prefixedCodec = addCodecSizePrefix(contentCodec, numberCodec as Codec<number>);
        assertIsVariableSize(prefixedCodec);
        expect(prefixedCodec.getSizeFromValue('helloworld')).toBe(14);
    });
});
