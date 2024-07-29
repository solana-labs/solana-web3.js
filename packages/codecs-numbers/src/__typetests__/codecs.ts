import type {
    FixedSizeNumberCodec,
    FixedSizeNumberDecoder,
    FixedSizeNumberEncoder,
    NumberCodec,
    NumberDecoder,
    NumberEncoder,
} from '../common';
import { getF32Codec, getF32Decoder, getF32Encoder } from '../f32';
import { getF64Codec, getF64Decoder, getF64Encoder } from '../f64';
import { getI8Codec, getI8Decoder, getI8Encoder } from '../i8';
import { getI16Codec, getI16Decoder, getI16Encoder } from '../i16';
import { getI32Codec, getI32Decoder, getI32Encoder } from '../i32';
import { getI64Codec, getI64Decoder, getI64Encoder } from '../i64';
import { getI128Codec, getI128Decoder, getI128Encoder } from '../i128';
import { getShortU16Codec, getShortU16Decoder, getShortU16Encoder } from '../short-u16';
import { getU8Codec, getU8Decoder, getU8Encoder } from '../u8';
import { getU16Codec, getU16Decoder, getU16Encoder } from '../u16';
import { getU32Codec, getU32Decoder, getU32Encoder } from '../u32';
import { getU64Codec, getU64Decoder, getU64Encoder } from '../u64';
import { getU128Codec, getU128Decoder, getU128Encoder } from '../u128';

getF32Encoder() satisfies NumberEncoder;
getF32Encoder() satisfies FixedSizeNumberEncoder;
getF32Decoder() satisfies NumberDecoder;
getF32Decoder() satisfies FixedSizeNumberDecoder;
getF32Codec() satisfies NumberCodec;
getF32Codec() satisfies FixedSizeNumberCodec;
getF32Codec() satisfies NumberEncoder;
getF32Codec() satisfies FixedSizeNumberEncoder;
getF32Codec() satisfies NumberDecoder;
getF32Codec() satisfies FixedSizeNumberDecoder;

getF64Encoder() satisfies NumberEncoder;
getF64Encoder() satisfies FixedSizeNumberEncoder;
getF64Decoder() satisfies NumberDecoder;
getF64Decoder() satisfies FixedSizeNumberDecoder;
getF64Codec() satisfies NumberCodec;
getF64Codec() satisfies FixedSizeNumberCodec;
getF64Codec() satisfies NumberEncoder;
getF64Codec() satisfies FixedSizeNumberEncoder;
getF64Codec() satisfies NumberDecoder;
getF64Codec() satisfies FixedSizeNumberDecoder;

getI8Encoder() satisfies NumberEncoder;
getI8Encoder() satisfies FixedSizeNumberEncoder;
getI8Decoder() satisfies NumberDecoder;
getI8Decoder() satisfies FixedSizeNumberDecoder;
getI8Codec() satisfies NumberCodec;
getI8Codec() satisfies FixedSizeNumberCodec;
getI8Codec() satisfies NumberEncoder;
getI8Codec() satisfies FixedSizeNumberEncoder;
getI8Codec() satisfies NumberDecoder;
getI8Codec() satisfies FixedSizeNumberDecoder;

getI16Encoder() satisfies NumberEncoder;
getI16Encoder() satisfies FixedSizeNumberEncoder;
getI16Decoder() satisfies NumberDecoder;
getI16Decoder() satisfies FixedSizeNumberDecoder;
getI16Codec() satisfies NumberCodec;
getI16Codec() satisfies FixedSizeNumberCodec;
getI16Codec() satisfies NumberEncoder;
getI16Codec() satisfies FixedSizeNumberEncoder;
getI16Codec() satisfies NumberDecoder;
getI16Codec() satisfies FixedSizeNumberDecoder;

getI32Encoder() satisfies NumberEncoder;
getI32Encoder() satisfies FixedSizeNumberEncoder;
getI32Decoder() satisfies NumberDecoder;
getI32Decoder() satisfies FixedSizeNumberDecoder;
getI32Codec() satisfies NumberCodec;
getI32Codec() satisfies FixedSizeNumberCodec;
getI32Codec() satisfies NumberEncoder;
getI32Codec() satisfies FixedSizeNumberEncoder;
getI32Codec() satisfies NumberDecoder;
getI32Codec() satisfies FixedSizeNumberDecoder;

getI64Encoder() satisfies NumberEncoder;
getI64Encoder() satisfies FixedSizeNumberEncoder;
getI64Decoder() satisfies NumberDecoder;
getI64Decoder() satisfies FixedSizeNumberDecoder;
getI64Codec() satisfies NumberCodec;
getI64Codec() satisfies FixedSizeNumberCodec;
getI64Codec() satisfies NumberEncoder;
getI64Codec() satisfies FixedSizeNumberEncoder;
getI64Codec() satisfies NumberDecoder;
getI64Codec() satisfies FixedSizeNumberDecoder;

getI128Encoder() satisfies NumberEncoder;
getI128Encoder() satisfies FixedSizeNumberEncoder;
getI128Decoder() satisfies NumberDecoder;
getI128Decoder() satisfies FixedSizeNumberDecoder;
getI128Codec() satisfies NumberCodec;
getI128Codec() satisfies FixedSizeNumberCodec;
getI128Codec() satisfies NumberEncoder;
getI128Codec() satisfies FixedSizeNumberEncoder;
getI128Codec() satisfies NumberDecoder;
getI128Codec() satisfies FixedSizeNumberDecoder;

getShortU16Encoder() satisfies NumberEncoder;
// @ts-expect-error variable size encoder
getShortU16Encoder() satisfies FixedSizeNumberEncoder;
getShortU16Decoder() satisfies NumberDecoder;
// @ts-expect-error variable size decoder
getShortU16Decoder() satisfies FixedSizeNumberDecoder;
getShortU16Codec() satisfies NumberCodec;
// @ts-expect-error variable size codec
getShortU16Codec() satisfies FixedSizeNumberCodec;
getShortU16Codec() satisfies NumberEncoder;
// @ts-expect-error variable size encoder
getShortU16Codec() satisfies FixedSizeNumberEncoder;
getShortU16Codec() satisfies NumberDecoder;
// @ts-expect-error variable size decoder
getShortU16Codec() satisfies FixedSizeNumberDecoder;

getU8Encoder() satisfies NumberEncoder;
getU8Encoder() satisfies FixedSizeNumberEncoder;
getU8Decoder() satisfies NumberDecoder;
getU8Decoder() satisfies FixedSizeNumberDecoder;
getU8Codec() satisfies NumberCodec;
getU8Codec() satisfies FixedSizeNumberCodec;
getU8Codec() satisfies NumberEncoder;
getU8Codec() satisfies FixedSizeNumberEncoder;
getU8Codec() satisfies NumberDecoder;
getU8Codec() satisfies FixedSizeNumberDecoder;

getU16Encoder() satisfies NumberEncoder;
getU16Encoder() satisfies FixedSizeNumberEncoder;
getU16Decoder() satisfies NumberDecoder;
getU16Decoder() satisfies FixedSizeNumberDecoder;
getU16Codec() satisfies NumberCodec;
getU16Codec() satisfies FixedSizeNumberCodec;
getU16Codec() satisfies NumberEncoder;
getU16Codec() satisfies FixedSizeNumberEncoder;
getU16Codec() satisfies NumberDecoder;
getU16Codec() satisfies FixedSizeNumberDecoder;

getU32Encoder() satisfies NumberEncoder;
getU32Encoder() satisfies FixedSizeNumberEncoder;
getU32Decoder() satisfies NumberDecoder;
getU32Decoder() satisfies FixedSizeNumberDecoder;
getU32Codec() satisfies NumberCodec;
getU32Codec() satisfies FixedSizeNumberCodec;
getU32Codec() satisfies NumberEncoder;
getU32Codec() satisfies FixedSizeNumberEncoder;
getU32Codec() satisfies NumberDecoder;
getU32Codec() satisfies FixedSizeNumberDecoder;

getU64Encoder() satisfies NumberEncoder;
getU64Encoder() satisfies FixedSizeNumberEncoder;
getU64Decoder() satisfies NumberDecoder;
getU64Decoder() satisfies FixedSizeNumberDecoder;
getU64Codec() satisfies NumberCodec;
getU64Codec() satisfies FixedSizeNumberCodec;
getU64Codec() satisfies NumberEncoder;
getU64Codec() satisfies FixedSizeNumberEncoder;
getU64Codec() satisfies NumberDecoder;
getU64Codec() satisfies FixedSizeNumberDecoder;

getU128Encoder() satisfies NumberEncoder;
getU128Encoder() satisfies FixedSizeNumberEncoder;
getU128Decoder() satisfies NumberDecoder;
getU128Decoder() satisfies FixedSizeNumberDecoder;
getU128Codec() satisfies NumberCodec;
getU128Codec() satisfies FixedSizeNumberCodec;
getU128Codec() satisfies NumberEncoder;
getU128Codec() satisfies FixedSizeNumberEncoder;
getU128Codec() satisfies NumberDecoder;
getU128Codec() satisfies FixedSizeNumberDecoder;
