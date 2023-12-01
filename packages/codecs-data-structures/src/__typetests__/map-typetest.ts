import {
    Codec,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';

import { getMapCodec, getMapDecoder, getMapEncoder } from '../map';

{
    // [getMapEncoder]: It knows if the encoder is fixed size or variable size.
    const fixedKeyValue = [{} as FixedSizeEncoder<string>, {} as FixedSizeEncoder<number>] as const;
    const anyKeyValue = [{} as Encoder<string>, {} as Encoder<number>] as const;

    getMapEncoder(...fixedKeyValue) satisfies VariableSizeEncoder<Map<string, number>>;
    getMapEncoder(...fixedKeyValue, { size: 42 }) satisfies FixedSizeEncoder<Map<string, number>>;
    getMapEncoder(...anyKeyValue, { size: 0 }) satisfies FixedSizeEncoder<Map<string, number>, 0>;
    getMapEncoder(...fixedKeyValue, { size: 'remainder' }) satisfies VariableSizeEncoder<Map<string, number>>;

    // @ts-expect-error Remainder size cannot be used with fixed-size keys.
    getMapEncoder({} as VariableSizeEncoder<string>, {} as FixedSizeEncoder<number>, { size: 'remainder' });

    // @ts-expect-error Remainder size cannot be used with fixed-size values.
    getMapEncoder({} as FixedSizeEncoder<string>, {} as VariableSizeEncoder<number>, { size: 'remainder' });
}

{
    // [getMapDecoder]: It knows if the decoder is fixed size or variable size.
    const fixedKeyValue = [{} as FixedSizeDecoder<string>, {} as FixedSizeDecoder<number>] as const;
    const anyKeyValue = [{} as Decoder<string>, {} as Decoder<number>] as const;

    getMapDecoder(...fixedKeyValue) satisfies VariableSizeDecoder<Map<string, number>>;
    getMapDecoder(...fixedKeyValue, { size: 42 }) satisfies FixedSizeDecoder<Map<string, number>>;
    getMapDecoder(...anyKeyValue, { size: 0 }) satisfies FixedSizeDecoder<Map<string, number>, 0>;
    getMapDecoder(...fixedKeyValue, { size: 'remainder' }) satisfies VariableSizeDecoder<Map<string, number>>;

    // @ts-expect-error Remainder size cannot be used with fixed-size keys.
    getMapDecoder({} as VariableSizeDecoder<string>, {} as FixedSizeDecoder<number>, { size: 'remainder' });

    // @ts-expect-error Remainder size cannot be used with fixed-size values.
    getMapDecoder({} as FixedSizeDecoder<string>, {} as VariableSizeDecoder<number>, { size: 'remainder' });
}

{
    // [getMapCodec]: It knows if the Codec is fixed size or variable size.
    const fixedKeyValue = [{} as FixedSizeCodec<string>, {} as FixedSizeCodec<number>] as const;
    const anyKeyValue = [{} as Codec<string>, {} as Codec<number>] as const;

    getMapCodec(...fixedKeyValue) satisfies VariableSizeCodec<Map<string, number>>;
    getMapCodec(...fixedKeyValue, { size: 42 }) satisfies FixedSizeCodec<Map<string, number>>;
    getMapCodec(...anyKeyValue, { size: 0 }) satisfies FixedSizeCodec<Map<string, number>, Map<string, number>, 0>;
    getMapCodec(...fixedKeyValue, { size: 'remainder' }) satisfies VariableSizeCodec<Map<string, number>>;

    // @ts-expect-error Remainder size cannot be used with fixed-size keys.
    getMapCodec({} as VariableSizeCodec<string>, {} as FixedSizeCodec<number>, { size: 'remainder' });

    // @ts-expect-error Remainder size cannot be used with fixed-size values.
    getMapCodec({} as FixedSizeCodec<string>, {} as VariableSizeCodec<number>, { size: 'remainder' });
}
