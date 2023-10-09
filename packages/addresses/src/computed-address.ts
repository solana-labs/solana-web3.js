import { assertDigestCapabilityIsAvailable } from '@solana/assertions';

import { Base58EncodedAddress, getAddressCodec } from './address';
import { compressedPointBytesAreOnCurve } from './curve';

type PDAInput = Readonly<{
    programAddress: Base58EncodedAddress;
    seeds: Seed[];
}>;

type SeedInput = Readonly<{
    baseAddress: Base58EncodedAddress;
    programAddress: Base58EncodedAddress;
    seed: Seed;
}>;

type Seed = string | Uint8Array;

const MAX_SEED_LENGTH = 32;
const MAX_SEEDS = 16;
const PDA_MARKER_BYTES = [
    // The string 'ProgramDerivedAddress'
    80, 114, 111, 103, 114, 97, 109, 68, 101, 114, 105, 118, 101, 100, 65, 100, 100, 114, 101, 115, 115,
] as const;

// TODO: Coded error.
class PointOnCurveError extends Error {}

async function createProgramDerivedAddress({ programAddress, seeds }: PDAInput): Promise<Base58EncodedAddress> {
    await assertDigestCapabilityIsAvailable();
    if (seeds.length > MAX_SEEDS) {
        // TODO: Coded error.
        throw new Error(`A maximum of ${MAX_SEEDS} seeds may be supplied when creating an address`);
    }
    let textEncoder: TextEncoder;
    const seedBytes = seeds.reduce((acc, seed, ii) => {
        const bytes = typeof seed === 'string' ? (textEncoder ||= new TextEncoder()).encode(seed) : seed;
        if (bytes.byteLength > MAX_SEED_LENGTH) {
            // TODO: Coded error.
            throw new Error(`The seed at index ${ii} exceeds the maximum length of 32 bytes`);
        }
        acc.push(...bytes);
        return acc;
    }, [] as number[]);
    const base58EncodedAddressCodec = getAddressCodec();
    const programAddressBytes = base58EncodedAddressCodec.serialize(programAddress);
    const addressBytesBuffer = await crypto.subtle.digest(
        'SHA-256',
        new Uint8Array([...seedBytes, ...programAddressBytes, ...PDA_MARKER_BYTES])
    );
    const addressBytes = new Uint8Array(addressBytesBuffer);
    if (await compressedPointBytesAreOnCurve(addressBytes)) {
        // TODO: Coded error.
        throw new PointOnCurveError('Invalid seeds; point must fall off the Ed25519 curve');
    }
    return base58EncodedAddressCodec.deserialize(addressBytes)[0];
}

export async function getProgramDerivedAddress({ programAddress, seeds }: PDAInput): Promise<
    Readonly<{
        bumpSeed: number;
        pda: Base58EncodedAddress;
    }>
> {
    let bumpSeed = 255;
    while (bumpSeed > 0) {
        try {
            return {
                bumpSeed,
                pda: await createProgramDerivedAddress({
                    programAddress,
                    seeds: [...seeds, new Uint8Array([bumpSeed])],
                }),
            };
        } catch (e) {
            if (e instanceof PointOnCurveError) {
                bumpSeed--;
            } else {
                throw e;
            }
        }
    }
    // TODO: Coded error.
    throw new Error('Unable to find a viable program address bump seed');
}

export async function createAddressWithSeed({
    baseAddress,
    programAddress,
    seed,
}: SeedInput): Promise<Base58EncodedAddress> {
    const { serialize, deserialize } = getAddressCodec();

    const seedBytes = typeof seed === 'string' ? new TextEncoder().encode(seed) : seed;
    if (seedBytes.byteLength > MAX_SEED_LENGTH) {
        // TODO: Coded error.
        throw new Error(`The seed exceeds the maximum length of 32 bytes`);
    }

    const programAddressBytes = serialize(programAddress);
    if (
        programAddressBytes.length >= PDA_MARKER_BYTES.length &&
        programAddressBytes.slice(-PDA_MARKER_BYTES.length).every((byte, index) => byte === PDA_MARKER_BYTES[index])
    ) {
        // TODO: Coded error.
        throw new Error(`programAddress cannot end with the PDA marker`);
    }

    const addressBytesBuffer = await crypto.subtle.digest(
        'SHA-256',
        new Uint8Array([...serialize(baseAddress), ...seedBytes, ...programAddressBytes])
    );
    const addressBytes = new Uint8Array(addressBytesBuffer);

    return deserialize(addressBytes)[0];
}
