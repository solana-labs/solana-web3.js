import { getBooleanCodec, getBytesCodec, getStructCodec } from '@solana/codecs-data-structures';
import { getU8Codec, getU16Codec, getU32Codec, getU64Codec, getU128Codec } from '@solana/codecs-numbers';
import { getBase58Codec, getBase64Codec, getStringCodec } from '@solana/codecs-strings';

import { FieldType, ProgramAstType } from './types';

function buildFieldCodec(type: FieldType) {
    switch (type) {
        case 'boolean':
            return getBooleanCodec();
        case 'string':
            return getStringCodec();
        case 'u8':
            return getU8Codec();
        case 'u16':
            return getU16Codec();
        case 'u32':
            return getU32Codec();
        case 'u64':
            return getU64Codec();
        case 'u128':
            return getU128Codec();
        case 'publicKey':
            return getBytesCodec({ size: 32 });
    }
}

function buildStructCodec(astType: ProgramAstType) {
    return getStructCodec(
        astType.type.fields.map(field => [field.name, buildFieldCodec(field.type)]) as Parameters<
            typeof getStructCodec
        >[0]
    );
}

function getCodecForEncoding(encoding: 'base58' | 'base64' | string) {
    switch (encoding) {
        case 'base58':
            return getBase58Codec();
        case 'base64':
            return getBase64Codec();
        default:
            throw new Error(`Unsupported encoding for codecs: ${encoding}`);
    }
}

/* Transform encoded data into the parsed type */
export function buildDecoder(astType: ProgramAstType) {
    const structDecoder = buildStructCodec(astType);
    return (data: string, encoding: 'base58' | 'base64') =>
        structDecoder.decode(getCodecForEncoding(encoding).encode(data));
}
