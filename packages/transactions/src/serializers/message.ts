import { getAddressDecoder, getAddressEncoder } from '@solana/addresses';
import {
    combineCodec,
    createEncoder,
    Decoder,
    mapDecoder,
    mapEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import {
    getArrayDecoder,
    getArrayEncoder,
    getStructDecoder,
    getStructEncoder,
    StructToDecoderTuple,
    StructToEncoderTuple,
} from '@solana/codecs-data-structures';
import { getShortU16Decoder, getShortU16Encoder } from '@solana/codecs-numbers';
import { getBase58Decoder, getBase58Encoder, getStringDecoder, getStringEncoder } from '@solana/codecs-strings';

import { getCompiledAddressTableLookups } from '../compile-address-table-lookups';
import { CompiledMessage } from '../message';
import { getAddressTableLookupDecoder, getAddressTableLookupEncoder } from './address-table-lookup';
import { getMessageHeaderDecoder, getMessageHeaderEncoder } from './header';
import { getInstructionDecoder, getInstructionEncoder } from './instruction';
import { getTransactionVersionDecoder, getTransactionVersionEncoder } from './transaction-version';

function getCompiledMessageLegacyEncoder(): VariableSizeEncoder<CompiledMessage> {
    return getStructEncoder(getPreludeStructEncoderTuple());
}

function getCompiledMessageVersionedEncoder(): VariableSizeEncoder<CompiledMessage> {
    return mapEncoder(
        getStructEncoder([
            ...getPreludeStructEncoderTuple(),
            ['addressTableLookups', getAddressTableLookupArrayEncoder()],
        ] as StructToEncoderTuple<CompiledMessage>),
        (value: CompiledMessage) => {
            if (value.version === 'legacy') {
                return value;
            }
            return {
                ...value,
                addressTableLookups: value.addressTableLookups ?? [],
            } as Exclude<CompiledMessage, { readonly version: 'legacy' }>;
        },
    );
}

function getPreludeStructEncoderTuple(): StructToEncoderTuple<CompiledMessage> {
    return [
        ['version', getTransactionVersionEncoder()],
        ['header', getMessageHeaderEncoder()],
        ['staticAccounts', getArrayEncoder(getAddressEncoder(), { size: getShortU16Encoder() })],
        ['lifetimeToken', getStringEncoder({ encoding: getBase58Encoder(), size: 32 })],
        ['instructions', getArrayEncoder(getInstructionEncoder(), { size: getShortU16Encoder() })],
    ];
}

function getPreludeStructDecoderTuple(): StructToDecoderTuple<
    CompiledMessage & { addressTableLookups?: ReturnType<typeof getCompiledAddressTableLookups> }
> {
    return [
        ['version', getTransactionVersionDecoder() as Decoder<number>],
        ['header', getMessageHeaderDecoder()],
        ['staticAccounts', getArrayDecoder(getAddressDecoder(), { size: getShortU16Decoder() })],
        ['lifetimeToken', getStringDecoder({ encoding: getBase58Decoder(), size: 32 })],
        ['instructions', getArrayDecoder(getInstructionDecoder(), { size: getShortU16Decoder() })],
        ['addressTableLookups', getAddressTableLookupArrayDecoder()],
    ];
}

function getAddressTableLookupArrayEncoder() {
    return getArrayEncoder(getAddressTableLookupEncoder(), { size: getShortU16Encoder() });
}

function getAddressTableLookupArrayDecoder() {
    return getArrayDecoder(getAddressTableLookupDecoder(), { size: getShortU16Decoder() });
}

export function getCompiledMessageEncoder(): VariableSizeEncoder<CompiledMessage> {
    return createEncoder({
        getSizeFromValue: (compiledMessage: CompiledMessage) => {
            if (compiledMessage.version === 'legacy') {
                return getCompiledMessageLegacyEncoder().getSizeFromValue(compiledMessage);
            } else {
                return getCompiledMessageVersionedEncoder().getSizeFromValue(compiledMessage);
            }
        },
        write: (compiledMessage, bytes, offset) => {
            if (compiledMessage.version === 'legacy') {
                return getCompiledMessageLegacyEncoder().write(compiledMessage, bytes, offset);
            } else {
                return getCompiledMessageVersionedEncoder().write(compiledMessage, bytes, offset);
            }
        },
    });
}

export function getCompiledMessageDecoder(): VariableSizeDecoder<CompiledMessage> {
    return mapDecoder(getStructDecoder(getPreludeStructDecoderTuple()), ({ addressTableLookups, ...restOfMessage }) => {
        if (restOfMessage.version === 'legacy' || !addressTableLookups?.length) {
            return restOfMessage;
        }
        return { ...restOfMessage, addressTableLookups } as Exclude<CompiledMessage, { readonly version: 'legacy' }>;
    });
}

export function getCompiledMessageCodec(): VariableSizeCodec<CompiledMessage> {
    return combineCodec(getCompiledMessageEncoder(), getCompiledMessageDecoder());
}
