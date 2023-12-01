import { Codec, createCodec } from '../codec';

export const b = (s: string) => base16.encode(s);

export const base16: Codec<string> = createCodec({
    fixedSize: null,
    read(bytes, offset) {
        const value = bytes.slice(offset).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
        return [value, bytes.length];
    },
    variableSize: (value: string) => Math.ceil(value.length / 2),
    write(value: string, bytes, offset) {
        const matches = value.toLowerCase().match(/.{1,2}/g);
        const hexBytes = matches ? matches.map((byte: string) => parseInt(byte, 16)) : [];
        bytes.set(hexBytes, offset);
        return offset + hexBytes.length;
    },
});

export const getMockCodec = (
    config: {
        defaultValue?: string;
        description?: string;
        size?: number | null;
    } = {}
) =>
    createCodec({
        fixedSize: config.size ?? null,
        maxSize: config.size ?? undefined,
        read: jest.fn().mockReturnValue([config.defaultValue ?? '', 0]),
        variableSize: jest.fn().mockReturnValue(config.size ?? 0),
        write: jest.fn().mockReturnValue(0),
    }) as Codec<unknown> & {
        readonly read: jest.Mock;
        readonly variableSize: jest.Mock;
        readonly write: jest.Mock;
    };
