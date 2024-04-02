import { Codec, createCodec } from '@solana/codecs-core';
import { getBase16Codec } from '@solana/codecs-strings';

export const base16 = getBase16Codec();
export const b = (s: string) => base16.encode(s);

export const getMockCodec = (
    config: {
        defaultValue?: string;
        description?: string;
        size?: number | null;
    } = {},
) =>
    createCodec({
        ...(config.size != null ? { fixedSize: config.size } : { getSizeFromValue: jest.fn().mockReturnValue(0) }),
        read: jest.fn().mockReturnValue([config.defaultValue ?? '', 0]),
        write: jest.fn().mockReturnValue(0),
    }) as Codec<unknown> & {
        readonly getSizeFromValue: jest.Mock;
        readonly read: jest.Mock;
        readonly write: jest.Mock;
    };
