import { getAddressDecoder, getAddressEncoder } from '@solana/addresses';
import { Codec, combineCodec, Decoder, Encoder, mapDecoder, mapEncoder } from '@solana/codecs-core';
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
import { SerializedMessageBytes } from '../types';
import { getAddressTableLookupDecoder, getAddressTableLookupEncoder } from './address-table-lookup';
import { getMessageHeaderDecoder, getMessageHeaderEncoder } from './header';
import { getInstructionDecoder, getInstructionEncoder } from './instruction';
import { getTransactionVersionDecoder, getTransactionVersionEncoder } from './transaction-version';

const staticAccountsDescription = __DEV__
    ? 'A compact-array of static account addresses belonging to this transaction'
    : 'staticAccounts';
const lifetimeTokenDescription = __DEV__
    ? 'A 32-byte token that specifies the lifetime of this transaction (eg. a ' +
      'recent blockhash, or a durable nonce)'
    : 'lifetimeToken';
const instructionsDescription = __DEV__
    ? 'A compact-array of instructions belonging to this transaction'
    : 'instructions';
const addressTableLookupsDescription = __DEV__
    ? 'A compact array of address table lookups belonging to this transaction'
    : 'addressTableLookups';

function getCompiledMessageLegacyEncoder(): Encoder<CompiledMessage> {
    return getStructEncoder(getPreludeStructEncoderTuple());
}

function getCompiledMessageVersionedEncoder(): Encoder<CompiledMessage> {
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
        }
    );
}

function getPreludeStructEncoderTuple(): StructToEncoderTuple<CompiledMessage> {
    return [
        ['version', getTransactionVersionEncoder()],
        ['header', getMessageHeaderEncoder()],
        [
            'staticAccounts',
            getArrayEncoder(getAddressEncoder(), {
                description: staticAccountsDescription,
                size: getShortU16Encoder(),
            }),
        ],
        [
            'lifetimeToken',
            getStringEncoder({
                description: lifetimeTokenDescription,
                encoding: getBase58Encoder(),
                size: 32,
            }),
        ],
        [
            'instructions',
            getArrayEncoder(getInstructionEncoder(), {
                description: instructionsDescription,
                size: getShortU16Encoder(),
            }),
        ],
    ];
}

function getPreludeStructDecoderTuple(): StructToDecoderTuple<
    CompiledMessage & { addressTableLookups?: ReturnType<typeof getCompiledAddressTableLookups> }
> {
    return [
        ['version', getTransactionVersionDecoder() as Decoder<number>],
        ['header', getMessageHeaderDecoder()],
        [
            'staticAccounts',
            getArrayDecoder(getAddressDecoder(), {
                description: staticAccountsDescription,
                size: getShortU16Decoder(),
            }),
        ],
        [
            'lifetimeToken',
            getStringDecoder({
                description: lifetimeTokenDescription,
                encoding: getBase58Decoder(),
                size: 32,
            }),
        ],
        [
            'instructions',
            getArrayDecoder(getInstructionDecoder(), {
                description: instructionsDescription,
                size: getShortU16Decoder(),
            }),
        ],
        ['addressTableLookups', getAddressTableLookupArrayDecoder()],
    ];
}

function getAddressTableLookupArrayEncoder() {
    return getArrayEncoder(getAddressTableLookupEncoder(), {
        description: addressTableLookupsDescription,
        size: getShortU16Encoder(),
    });
}

function getAddressTableLookupArrayDecoder() {
    return getArrayDecoder(getAddressTableLookupDecoder(), {
        description: addressTableLookupsDescription,
        size: getShortU16Decoder(),
    });
}

const messageDescription = __DEV__ ? 'The wire format of a Solana transaction message' : 'message';

export function getCompiledMessageEncoder(): Encoder<CompiledMessage> {
    return {
        description: messageDescription,
        encode: compiledMessage => {
            if (compiledMessage.version === 'legacy') {
                return getCompiledMessageLegacyEncoder().encode(compiledMessage) as SerializedMessageBytes;
            } else {
                return getCompiledMessageVersionedEncoder().encode(compiledMessage) as SerializedMessageBytes;
            }
        },
        fixedSize: null,
        maxSize: null,
    };
}

export function getCompiledMessageDecoder(): Decoder<CompiledMessage> {
    return mapDecoder(
        getStructDecoder(getPreludeStructDecoderTuple(), {
            description: messageDescription,
        }),
        ({ addressTableLookups, ...restOfMessage }) => {
            if (restOfMessage.version === 'legacy' || !addressTableLookups?.length) {
                return restOfMessage;
            }
            return { ...restOfMessage, addressTableLookups } as Exclude<
                CompiledMessage,
                { readonly version: 'legacy' }
            >;
        }
    );
}

export function getCompiledMessageCodec(): Codec<CompiledMessage> {
    return combineCodec(getCompiledMessageEncoder(), getCompiledMessageDecoder());
}
