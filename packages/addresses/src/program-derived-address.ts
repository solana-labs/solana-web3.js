import { assertDigestCapabilityIsAvailable } from '@solana/assertions';
import {
    isSolanaError,
    SOLANA_ERROR__ADDRESSES__FAILED_TO_FIND_VIABLE_PDA_BUMP_SEED,
    SOLANA_ERROR__ADDRESSES__INVALID_SEEDS_POINT_ON_CURVE,
    SOLANA_ERROR__ADDRESSES__MALFORMED_PDA,
    SOLANA_ERROR__ADDRESSES__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED,
    SOLANA_ERROR__ADDRESSES__MAX_PDA_SEED_LENGTH_EXCEEDED,
    SOLANA_ERROR__ADDRESSES__PDA_BUMP_SEED_OUT_OF_RANGE,
    SOLANA_ERROR__ADDRESSES__PDA_ENDS_WITH_PDA_MARKER,
    SolanaError,
} from '@solana/errors';

import { Address, assertIsAddress, getAddressCodec, isAddress } from './address';
import { compressedPointBytesAreOnCurve } from './curve';

/**
 * An address derived from a program address and a set of seeds.
 * It includes the bump seed used to derive the address and
 * ensure the address is not on the Ed25519 curve.
 */
export type ProgramDerivedAddress<TAddress extends string = string> = Readonly<
    [Address<TAddress>, ProgramDerivedAddressBump]
>;

/**
 * A number between 0 and 255, inclusive.
 */
export type ProgramDerivedAddressBump = number & {
    readonly __brand: unique symbol;
};

/**
 * Returns true if the input value is a program derived address.
 */
export function isProgramDerivedAddress<TAddress extends string = string>(
    value: unknown,
): value is ProgramDerivedAddress<TAddress> {
    return (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'string' &&
        typeof value[1] === 'number' &&
        value[1] >= 0 &&
        value[1] <= 255 &&
        isAddress(value[0])
    );
}

/**
 * Fails if the input value is not a program derived address.
 */
export function assertIsProgramDerivedAddress<TAddress extends string = string>(
    value: unknown,
): asserts value is ProgramDerivedAddress<TAddress> {
    const validFormat =
        Array.isArray(value) && value.length === 2 && typeof value[0] === 'string' && typeof value[1] === 'number';
    if (!validFormat) {
        throw new SolanaError(SOLANA_ERROR__ADDRESSES__MALFORMED_PDA);
    }
    if (value[1] < 0 || value[1] > 255) {
        throw new SolanaError(SOLANA_ERROR__ADDRESSES__PDA_BUMP_SEED_OUT_OF_RANGE, {
            bump: value[1],
        });
    }
    assertIsAddress(value[0]);
}

type ProgramDerivedAddressInput = Readonly<{
    programAddress: Address;
    seeds: Seed[];
}>;

type SeedInput = Readonly<{
    baseAddress: Address;
    programAddress: Address;
    seed: Seed;
}>;

type Seed = Uint8Array | string;

const MAX_SEED_LENGTH = 32;
const MAX_SEEDS = 16;
const PDA_MARKER_BYTES = [
    // The string 'ProgramDerivedAddress'
    80, 114, 111, 103, 114, 97, 109, 68, 101, 114, 105, 118, 101, 100, 65, 100, 100, 114, 101, 115, 115,
] as const;

async function createProgramDerivedAddress({ programAddress, seeds }: ProgramDerivedAddressInput): Promise<Address> {
    assertDigestCapabilityIsAvailable();
    if (seeds.length > MAX_SEEDS) {
        throw new SolanaError(SOLANA_ERROR__ADDRESSES__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED, {
            actual: seeds.length,
            maxSeeds: MAX_SEEDS,
        });
    }
    let textEncoder: TextEncoder;
    const seedBytes = seeds.reduce((acc, seed, ii) => {
        const bytes = typeof seed === 'string' ? (textEncoder ||= new TextEncoder()).encode(seed) : seed;
        if (bytes.byteLength > MAX_SEED_LENGTH) {
            throw new SolanaError(SOLANA_ERROR__ADDRESSES__MAX_PDA_SEED_LENGTH_EXCEEDED, {
                actual: bytes.byteLength,
                index: ii,
                maxSeedLength: MAX_SEED_LENGTH,
            });
        }
        acc.push(...bytes);
        return acc;
    }, [] as number[]);
    const base58EncodedAddressCodec = getAddressCodec();
    const programAddressBytes = base58EncodedAddressCodec.encode(programAddress);
    const addressBytesBuffer = await crypto.subtle.digest(
        'SHA-256',
        new Uint8Array([...seedBytes, ...programAddressBytes, ...PDA_MARKER_BYTES]),
    );
    const addressBytes = new Uint8Array(addressBytesBuffer);
    if (compressedPointBytesAreOnCurve(addressBytes)) {
        throw new SolanaError(SOLANA_ERROR__ADDRESSES__INVALID_SEEDS_POINT_ON_CURVE);
    }
    return base58EncodedAddressCodec.decode(addressBytes);
}

export async function getProgramDerivedAddress({
    programAddress,
    seeds,
}: ProgramDerivedAddressInput): Promise<ProgramDerivedAddress> {
    let bumpSeed = 255;
    while (bumpSeed > 0) {
        try {
            const address = await createProgramDerivedAddress({
                programAddress,
                seeds: [...seeds, new Uint8Array([bumpSeed])],
            });
            return [address, bumpSeed as ProgramDerivedAddressBump];
        } catch (e) {
            if (isSolanaError(e, SOLANA_ERROR__ADDRESSES__INVALID_SEEDS_POINT_ON_CURVE)) {
                bumpSeed--;
            } else {
                throw e;
            }
        }
    }
    throw new SolanaError(SOLANA_ERROR__ADDRESSES__FAILED_TO_FIND_VIABLE_PDA_BUMP_SEED);
}

export async function createAddressWithSeed({ baseAddress, programAddress, seed }: SeedInput): Promise<Address> {
    const { encode, decode } = getAddressCodec();

    const seedBytes = typeof seed === 'string' ? new TextEncoder().encode(seed) : seed;
    if (seedBytes.byteLength > MAX_SEED_LENGTH) {
        throw new SolanaError(SOLANA_ERROR__ADDRESSES__MAX_PDA_SEED_LENGTH_EXCEEDED, {
            actual: seedBytes.byteLength,
            index: 0,
            maxSeedLength: MAX_SEED_LENGTH,
        });
    }

    const programAddressBytes = encode(programAddress);
    if (
        programAddressBytes.length >= PDA_MARKER_BYTES.length &&
        programAddressBytes.slice(-PDA_MARKER_BYTES.length).every((byte, index) => byte === PDA_MARKER_BYTES[index])
    ) {
        throw new SolanaError(SOLANA_ERROR__ADDRESSES__PDA_ENDS_WITH_PDA_MARKER);
    }

    const addressBytesBuffer = await crypto.subtle.digest(
        'SHA-256',
        new Uint8Array([...encode(baseAddress), ...seedBytes, ...programAddressBytes]),
    );
    const addressBytes = new Uint8Array(addressBytesBuffer);

    return decode(addressBytes);
}
