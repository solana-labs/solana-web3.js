import {
    array,
    base58,
    mapSerializer,
    Serializer,
    shortU16,
    string,
    struct,
    StructToSerializerTuple,
} from '@metaplex-foundation/umi-serializers';
import { getAddressCodec } from '@solana/addresses';
import { Codec } from '@solana/codecs-core';

import { CompiledMessage } from '../message';
import { SerializedMessageBytes } from '../types';
import { getAddressTableLookupCodec } from './address-table-lookup';
import { getMessageHeaderCodec } from './header';
import { getInstructionCodec } from './instruction';
import { getTransactionVersionCodec } from './transaction-version';
import { getUnimplementedDecoder, getUnimplementedEncoder } from './unimplemented';

const BASE_CONFIG = {
    description: __DEV__ ? 'The wire format of a Solana transaction message' : '',
    fixedSize: null,
    maxSize: null,
} as const;

function deserialize(bytes: Uint8Array, offset = 0): [CompiledMessage, number] {
    const preludeAndOffset = struct(getPreludeStructSerializerTuple()).deserialize(bytes, offset);
    const [prelude, endOfPreludeOffset] = preludeAndOffset;
    if (prelude.version === 'legacy') {
        return preludeAndOffset;
    }
    const [addressTableLookups, finalOffset] = getAddressTableLookupsSerializer().deserialize(
        bytes,
        endOfPreludeOffset
    );
    return [
        {
            ...prelude,
            ...(addressTableLookups.length ? { addressTableLookups } : null),
        },
        finalOffset,
    ];
}

function serialize(compiledMessage: CompiledMessage): SerializedMessageBytes {
    if (compiledMessage.version === 'legacy') {
        return struct(getPreludeStructSerializerTuple()).serialize(compiledMessage) as SerializedMessageBytes;
    } else {
        return mapSerializer(
            struct([
                ...getPreludeStructSerializerTuple(),
                ['addressTableLookups', getAddressTableLookupsSerializer()],
            ] as StructToSerializerTuple<CompiledMessage, CompiledMessage>),
            (value: CompiledMessage) => {
                if (value.version === 'legacy') {
                    return value;
                }
                return {
                    ...value,
                    addressTableLookups: value.addressTableLookups ?? [],
                } as Exclude<CompiledMessage, { readonly version: 'legacy' }>;
            }
        ).serialize(compiledMessage) as SerializedMessageBytes;
    }
}

// Temporary, convert a codec to a serializer for compatiblity for now
function toSerializer<T>(codec: Codec<T>): Serializer<T> {
    return {
        description: codec.description,
        deserialize: codec.decode,
        fixedSize: codec.fixedSize,
        maxSize: codec.maxSize,
        serialize: codec.encode,
    };
}

function getPreludeStructSerializerTuple(): StructToSerializerTuple<CompiledMessage, CompiledMessage> {
    return [
        ['version', toSerializer(getTransactionVersionCodec())],
        ['header', toSerializer(getMessageHeaderCodec())],
        [
            'staticAccounts',
            array(toSerializer(getAddressCodec()), {
                description: __DEV__ ? 'A compact-array of static account addresses belonging to this transaction' : '',
                size: shortU16(),
            }),
        ],
        [
            'lifetimeToken',
            string({
                description: __DEV__
                    ? 'A 32-byte token that specifies the lifetime of this transaction (eg. a ' +
                      'recent blockhash, or a durable nonce)'
                    : '',
                encoding: base58,
                size: 32,
            }),
        ],
        [
            'instructions',
            array(getInstructionCodec(), {
                description: __DEV__ ? 'A compact-array of instructions belonging to this transaction' : '',
                size: shortU16(),
            }),
        ],
    ];
}

function getAddressTableLookupsSerializer() {
    // temporary: will be changed to using codecs
    return array(toSerializer(getAddressTableLookupCodec()), {
        ...(__DEV__ ? { description: 'A compact array of address table lookups belonging to this transaction' } : null),
        size: shortU16(),
    });
}

export function getCompiledMessageEncoder(): Serializer<CompiledMessage> {
    return {
        ...BASE_CONFIG,
        deserialize: getUnimplementedDecoder('CompiledMessage'),
        serialize,
    };
}

export function getCompiledMessageDecoder(): Serializer<CompiledMessage> {
    return {
        ...BASE_CONFIG,
        deserialize,
        serialize: getUnimplementedEncoder('CompiledMessage'),
    };
}

export function getCompiledMessageCodec(): Serializer<CompiledMessage> {
    return {
        ...BASE_CONFIG,
        deserialize,
        serialize,
    };
}
