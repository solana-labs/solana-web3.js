/* eslint-disable sort-keys-fix/sort-keys-fix */
import { Codec } from './codec';

/**
 * Converts a codec A to a codec B by mapping their values.
 */
export function mapCodec<NewFrom, OldFrom, To extends NewFrom & OldFrom>(
    codec: Codec<OldFrom, To>,
    unmap: (value: NewFrom) => OldFrom
): Codec<NewFrom, To>;
export function mapCodec<NewFrom, OldFrom, NewTo extends NewFrom = NewFrom, OldTo extends OldFrom = OldFrom>(
    codec: Codec<OldFrom, OldTo>,
    unmap: (value: NewFrom) => OldFrom,
    map: (value: OldTo, buffer: Uint8Array, offset: number) => NewTo
): Codec<NewFrom, NewTo>;
export function mapCodec<NewFrom, OldFrom, NewTo extends NewFrom = NewFrom, OldTo extends OldFrom = OldFrom>(
    codec: Codec<OldFrom, OldTo>,
    unmap: (value: NewFrom) => OldFrom,
    map?: (value: OldTo, buffer: Uint8Array, offset: number) => NewTo
): Codec<NewFrom, NewTo> {
    return {
        description: codec.description,
        fixedSize: codec.fixedSize,
        maxSize: codec.maxSize,
        encode: (value: NewFrom) => codec.encode(unmap(value)),
        decode: (buffer: Uint8Array, offset = 0) => {
            const [value, length] = codec.decode(buffer, offset);
            return map ? [map(value, buffer, offset), length] : [value as unknown as NewTo, length];
        },
    };
}
