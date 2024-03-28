import { assertAccountExists, decodeAccount, type FetchAccountConfig } from '@solana/accounts';
import {
    combineCodec,
    createDecoder,
    createEncoder,
    type FixedSizeCodec,
    type FixedSizeDecoder,
    type FixedSizeEncoder,
    getArrayCodec,
    getU64Codec,
    getU64Decoder,
    getU64Encoder,
    ReadonlyUint8Array,
} from '@solana/codecs';
import {
    SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH,
    SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS,
    SolanaError,
} from '@solana/errors';
import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';
import type { Slot } from '@solana/rpc-types';

import { fetchEncodedSysvarAccount, SYSVAR_SLOT_HISTORY_ADDRESS } from './sysvar';

const BITVEC_DISCRIMINATOR = 1;
// Max number of bits in the bitvector.
// The Solana SDK defines a constant `MAX_ENTRIES` representing the maximum
// number of bits that can be represented by the bitvector in the `SlotHistory`
// sysvar. This value is 1024 * 1024 = 1_048_576.
// See https://github.com/solana-labs/solana/blob/e0203f22dc83cb792fa97f91dbe6e924cbd08af1/sdk/program/src/slot_history.rs#L43
const BITVEC_NUM_BITS = 1024 * 1024;
// The length of the bitvector in blocks.
// At 64 bits per block, this is 1024 * 1024 / 64 = 16_384.
const BITVEC_LENGTH = BITVEC_NUM_BITS / 64;

const SLOT_HISTORY_ACCOUNT_DATA_STATIC_SIZE =
    1 + // Discriminator
    8 + // bitvector length (u64)
    BITVEC_LENGTH * 8 +
    8 + // Number of bits (u64)
    8; // Next slot (u64)

let memoizedU64Encoder: FixedSizeEncoder<bigint, 8> | undefined;
let memoizedU64Decoder: FixedSizeDecoder<bigint, 8> | undefined;
let memoizedU64ArrayEncoder: FixedSizeEncoder<bigint[]> | undefined;
let memoizedU64ArrayDecoder: FixedSizeDecoder<bigint[]> | undefined;

function getMemoizedU64Encoder(): FixedSizeEncoder<bigint, 8> {
    if (!memoizedU64Encoder) memoizedU64Encoder = getU64Encoder();
    return memoizedU64Encoder;
}
function getMemoizedU64Decoder(): FixedSizeDecoder<bigint, 8> {
    if (!memoizedU64Decoder) memoizedU64Decoder = getU64Decoder();
    return memoizedU64Decoder;
}
function getMemoizedU64ArrayEncoder(): FixedSizeEncoder<bigint[], typeof BITVEC_LENGTH> {
    if (!memoizedU64ArrayEncoder) memoizedU64ArrayEncoder = getArrayCodec(getU64Codec(), { size: BITVEC_LENGTH });
    return memoizedU64ArrayEncoder;
}
function getMemoizedU64ArrayDecoder(): FixedSizeDecoder<bigint[], typeof BITVEC_LENGTH> {
    if (!memoizedU64ArrayDecoder) memoizedU64ArrayDecoder = getArrayCodec(getU64Codec(), { size: BITVEC_LENGTH });
    return memoizedU64ArrayDecoder;
}

type SysvarSlotHistorySize = typeof SLOT_HISTORY_ACCOUNT_DATA_STATIC_SIZE;

/**
 * The `SlotHistory` sysvar.
 *
 * A bitvector of slots present over the last epoch.
 */
export type SysvarSlotHistory = {
    bits: bigint[];
    nextSlot: Slot;
};

export function getSysvarSlotHistoryEncoder(): FixedSizeEncoder<SysvarSlotHistory, SysvarSlotHistorySize> {
    return createEncoder({
        fixedSize: SLOT_HISTORY_ACCOUNT_DATA_STATIC_SIZE,
        write: (value: SysvarSlotHistory, bytes, offset) => {
            // First byte is the bitvector discriminator.
            bytes.set([BITVEC_DISCRIMINATOR], offset);
            offset += 1;
            // Next 8 bytes are the bitvector length.
            getMemoizedU64Encoder().write(BigInt(BITVEC_LENGTH), bytes, offset);
            offset += 8;
            // Next `BITVEC_LENGTH` bytes are the bitvector.
            // Any missing bits are assumed to be 0.
            getMemoizedU64ArrayEncoder().write(value.bits, bytes, offset);
            offset += BITVEC_LENGTH * 8;
            // Next 8 bytes are the number of bits.
            getMemoizedU64Encoder().write(BigInt(BITVEC_NUM_BITS), bytes, offset);
            offset += 8;
            // Next 8 bytes are the next slot.
            getMemoizedU64Encoder().write(value.nextSlot, bytes, offset);
            offset += 8;
            return offset;
        },
    });
}

export function getSysvarSlotHistoryDecoder(): FixedSizeDecoder<SysvarSlotHistory, SysvarSlotHistorySize> {
    return createDecoder({
        fixedSize: SLOT_HISTORY_ACCOUNT_DATA_STATIC_SIZE,
        read: (bytes: ReadonlyUint8Array | Uint8Array, offset) => {
            // Byte length should be exact.
            if (bytes.length != SLOT_HISTORY_ACCOUNT_DATA_STATIC_SIZE) {
                throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH, {
                    actual: bytes.length,
                    expected: SLOT_HISTORY_ACCOUNT_DATA_STATIC_SIZE,
                });
            }
            // First byte is the bitvector discriminator.
            const discriminator = bytes[offset];
            offset += 1;
            if (discriminator !== BITVEC_DISCRIMINATOR) {
                throw new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                    actual: discriminator,
                    expected: BITVEC_DISCRIMINATOR,
                });
            }
            // Next 8 bytes are the bitvector length.
            const bitVecLength = getMemoizedU64Decoder().read(bytes, offset)[0];
            offset += 8;
            if (bitVecLength !== BigInt(BITVEC_LENGTH)) {
                throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS, {
                    actual: bitVecLength,
                    codecDescription: 'SysvarSlotHistoryCodec',
                    expected: BITVEC_LENGTH,
                });
            }
            // Next `BITVEC_LENGTH` bytes are the bitvector.
            const bits = getMemoizedU64ArrayDecoder().read(bytes, offset)[0];
            offset += BITVEC_LENGTH * 8;
            // Next 8 bytes are the number of bits.
            const numBits = getMemoizedU64Decoder().read(bytes, offset)[0];
            offset += 8;
            if (numBits !== BigInt(BITVEC_NUM_BITS)) {
                throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS, {
                    actual: numBits,
                    codecDescription: 'SysvarSlotHistoryCodec',
                    expected: BITVEC_NUM_BITS,
                });
            }
            // Next 8 bytes are the next slot.
            const nextSlot = getMemoizedU64Decoder().read(bytes, offset)[0];
            offset += 8;
            return [
                {
                    bits,
                    nextSlot,
                },
                offset,
            ];
        },
    });
}

export function getSysvarSlotHistoryCodec(): FixedSizeCodec<
    SysvarSlotHistory,
    SysvarSlotHistory,
    SysvarSlotHistorySize
> {
    return combineCodec(getSysvarSlotHistoryEncoder(), getSysvarSlotHistoryDecoder());
}

/**
 * Fetch the `SlotHistory` sysvar.
 *
 * A bitvector of slots present over the last epoch.
 */
export async function fetchSysvarSlotHistory(
    rpc: Rpc<GetAccountInfoApi>,
    config?: FetchAccountConfig,
): Promise<SysvarSlotHistory> {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_SLOT_HISTORY_ADDRESS, config);
    assertAccountExists(account);
    const decoded = decodeAccount(account, getSysvarSlotHistoryDecoder());
    return decoded.data;
}
