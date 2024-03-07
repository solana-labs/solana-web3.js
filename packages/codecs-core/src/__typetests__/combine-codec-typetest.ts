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
} from '../codec';
import { combineCodec } from '../combine-codec';

{
    // [combineCodec]: It keeps track of the fixed or variable size types.
    combineCodec({} as FixedSizeEncoder<string, 42>, {} as FixedSizeDecoder<string, 42>) satisfies FixedSizeCodec<
        string,
        string,
        42
    >;
    combineCodec(
        {} as VariableSizeEncoder<string>,
        {} as VariableSizeDecoder<string>,
    ) satisfies VariableSizeCodec<string>;
    combineCodec({} as Encoder<string>, {} as Decoder<string>) satisfies Codec<string>;
}

{
    // [combineCodec]: It authorizes From and To types that such that To extends From.
    combineCodec({} as Encoder<bigint | number>, {} as Decoder<bigint>) satisfies Codec<bigint | number, bigint>;
    combineCodec({} as Encoder<{ name: string }>, {} as Decoder<{ age: number; name: string }>) satisfies Codec<
        { name: string },
        { age: number; name: string }
    >;
}

{
    // [combineCodec]: It forbids From and To types that are not compatible.
    // @ts-expect-error Expected a number decoder or a string encoder.
    combineCodec({} as Encoder<number>, {} as Decoder<string>) satisfies Codec<string>;
    // @ts-expect-error number | bigint is not assignable to bigint.
    combineCodec({} as Encoder<bigint>, {} as Decoder<bigint | number>) satisfies Codec<bigint, bigint | number>;
    // @ts-expect-error The decoded value does not extend the encoded value.
    combineCodec({} as Encoder<{ age: number; name: string }>, {} as Decoder<{ name: string }>) satisfies Codec<
        { age: number; name: string },
        // @ts-expect-error Age property is missing.
        { name: string }
    >;
}
