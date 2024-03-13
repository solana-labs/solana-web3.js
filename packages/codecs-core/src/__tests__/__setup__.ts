import { Codec, createCodec, FixedSizeCodec } from '../codec';

export const b = (s: string) => base16.encode(s);

export const base16: Codec<string> = createCodec({
    getSizeFromValue: (value: string) => Math.ceil(value.length / 2),
    read(bytes, offset) {
        const value = bytes.slice(offset).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
        return [value, bytes.length];
    },
    write(value: string, bytes, offset) {
        const matches = value.toLowerCase().match(/.{1,2}/g);
        const hexBytes = matches ? matches.map((byte: string) => parseInt(byte, 16)) : [];
        bytes.set(hexBytes, offset);
        return offset + hexBytes.length;
    },
});

type GetMockCodecConfig = {
    defaultValue?: string;
    description?: string;
    innerSize?: number;
    size?: number | null;
};

type GetMockCodecReturnType = Codec<unknown> & {
    readonly getSizeFromValue: jest.Mock;
    readonly read: jest.Mock;
    readonly write: jest.Mock;
};

export function getMockCodec<TSize extends number>(
    config: GetMockCodecConfig & { size: TSize },
): FixedSizeCodec<unknown, unknown, TSize> & GetMockCodecReturnType;
export function getMockCodec(config?: GetMockCodecConfig): GetMockCodecReturnType;
export function getMockCodec(config: GetMockCodecConfig = {}): GetMockCodecReturnType {
    const innerSize = config.innerSize ?? config.size ?? 0;
    return createCodec({
        ...(config.size != null ? { fixedSize: config.size } : { getSizeFromValue: jest.fn().mockReturnValue(0) }),
        read: jest.fn().mockImplementation((_bytes, offset) => [config.defaultValue ?? '', offset + innerSize]),
        write: jest.fn().mockImplementation((_value, _bytes, offset) => offset + innerSize),
    }) as GetMockCodecReturnType;
}

export function expectNewPreOffset(
    codec: FixedSizeCodec<unknown>,
    mockCodec: FixedSizeCodec<unknown>,
    preOffset: number,
    expectedNewPreOffset: number,
) {
    const bytes = new Uint8Array(Array.from({ length: codec.fixedSize }, () => 0));
    codec.write(null, bytes, preOffset);
    expect(mockCodec.write).toHaveBeenCalledWith(null, bytes, expectedNewPreOffset);
    codec.read(bytes, preOffset)[1];
    expect(mockCodec.read).toHaveBeenCalledWith(bytes, expectedNewPreOffset);
}

export function expectNewPostOffset(codec: FixedSizeCodec<unknown>, preOffset: number, expectedNewPostOffset: number) {
    const bytes = new Uint8Array(Array.from({ length: codec.fixedSize }, () => 0));
    expect(codec.write(null, bytes, preOffset)).toBe(expectedNewPostOffset);
    expect(codec.read(bytes, preOffset)[1]).toBe(expectedNewPostOffset);
}
