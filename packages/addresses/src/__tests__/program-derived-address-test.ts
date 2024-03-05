import {
    SOLANA_ERROR__ADDRESSES__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED,
    SOLANA_ERROR__ADDRESSES__MAX_PDA_SEED_LENGTH_EXCEEDED,
    SOLANA_ERROR__ADDRESSES__PDA_ENDS_WITH_PDA_MARKER,
    SolanaError,
} from '@solana/errors';

import { Address } from '../address';
import { createAddressWithSeed, getProgramDerivedAddress } from '../program-derived-address';

describe('getProgramDerivedAddress()', () => {
    it('fatals when supplied more than 16 seeds', async () => {
        expect.assertions(1);
        await expect(
            getProgramDerivedAddress({
                programAddress: 'FN2R9R724eb4WaxeDmDYrUtmJgoSzkBiQMEHELV3ocyg' as Address,
                seeds: Array(17).fill(''),
            }),
        ).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__ADDRESSES__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED, {
                actual: 18, // With bump.
                maxSeeds: 16,
            }),
        );
    });
    it.each([new Uint8Array(Array(33).fill(0)), 'a'.repeat(33)])(
        'fatals when supplied a seed that is 33 bytes long',
        async oversizedSeed => {
            expect.assertions(1);
            await expect(
                getProgramDerivedAddress({
                    programAddress: '5eUi55m4FVaDqKubGH9r6ca1TxjmimmXEU9v1WUZJ47Z' as Address,
                    seeds: [oversizedSeed],
                }),
            ).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__ADDRESSES__MAX_PDA_SEED_LENGTH_EXCEEDED, {
                    actual: 33,
                    index: 0,
                    maxSeedLength: 32,
                }),
            );
        },
    );
    it('returns a program derived address given a program address and no seeds', async () => {
        expect.assertions(1);
        await expect(
            getProgramDerivedAddress({
                programAddress: 'CZ3TbkgUYpDAJVEWpujQhDSgzNTeqbokrJmYa1j4HAZc' as Address,
                seeds: [],
            }),
        ).resolves.toStrictEqual(['9tVtkyCGAHSDDBPwz7895aC3p2gJRjpu2v26o35FTUco', 255]);
    });
    it('returns a program derived address after having tried multiple bump seeds given a program address and no seeds', async () => {
        expect.assertions(1);
        await expect(
            getProgramDerivedAddress({
                programAddress: 'EfTbwNBrSqSuCNBhWUHsBoBdSMWgRU1S47daqRNgW7aK' as Address,
                seeds: [],
            }),
        ).resolves.toStrictEqual(['CKWT8KZ5GMzKpVRiAULWKPg1LiHt9U3NdAtbuTErHCTq', 251]);
    });
    it('returns a program derived address given a program address and a byte-array seed', async () => {
        expect.assertions(1);
        await expect(
            getProgramDerivedAddress({
                programAddress: 'FD3PDEvpQ9JXq8tv7FpJPyZrCjWkCnAaTju16gFPdpqP' as Address,
                seeds: [new Uint8Array([1, 2, 3])],
            }),
        ).resolves.toStrictEqual(['9Tj3hpMWacDiZoBe94sjwJQ72zsUVvEQYsrqyy2CfHky', 255]);
    });
    it('returns a program derived address after having tried multiple bump seeds given a program address and a byte-array seed', async () => {
        expect.assertions(1);
        await expect(
            getProgramDerivedAddress({
                programAddress: '9HT3iB4oX1aZPH5V8eNUGByKuwhfcKjBQ3x9rfEAuNeF' as Address,
                seeds: [new Uint8Array([1, 2, 3])],
            }),
        ).resolves.toStrictEqual(['EeTcRajHcPh74C5D4GqZePac1wYB7Dj9ChTaNHaTH77V', 251]);
    });
    it('returns a program derived address given a program address and a string seed', async () => {
        expect.assertions(1);
        await expect(
            getProgramDerivedAddress({
                programAddress: 'EKaNRGA37uiGRyRPMap5EZg9cmbT5mt7KWrGwKwAQ3rK' as Address,
                seeds: ['hello'],
            }),
        ).resolves.toStrictEqual(['6V76gtKMCmVVjrx4sxR9uB868HtZbL3piKEmadC7rSgf', 255]);
    });
    it('returns a program derived address after having tried multiple bump seeds given a program address and a string seed', async () => {
        expect.assertions(1);
        await expect(
            getProgramDerivedAddress({
                programAddress: '9PyoV2rqNtoboSvg2JD7GWhM5RQvHGwgdDvK7MCfpgX1' as Address,
                seeds: ['hello'],
            }),
        ).resolves.toStrictEqual(['E6npEurFu1UEbQFh1DsqBvny17XxUK2QPMgxD3Edn3aG', 251]);
    });
    it('returns a program derived address given a program address and a UTF-8 string seed', async () => {
        expect.assertions(1);
        await expect(
            getProgramDerivedAddress({
                programAddress: 'A5dcVPLJsE2vbf7hkqqyYkYDK9UjUfNxuwGtWF2m2vEz' as Address,
                seeds: ['\uD83D\uDE80'],
            }),
        ).resolves.toStrictEqual(['GYpAzW57Ex4Sw3rp4pq95QrjvtsDyqZsMhSZwqz3NMsE', 255]);
    });
    it('returns a program derived address after having tried multiple bump seeds given a program address and a UTF-8 string seed', async () => {
        expect.assertions(1);
        await expect(
            getProgramDerivedAddress({
                programAddress: 'H8gBP21L5ietkHgXcGbgQBCVVEdPUQyuP9Q5MPRLLSJu' as Address,
                seeds: ['\uD83D\uDE80'],
            }),
        ).resolves.toStrictEqual(['46v3JvPtEPeQmH3euXydEbxYD6yfxeZjWSzkkYvvM5Pp', 251]);
    });
    it('returns the same result given a program address and two different seed inputs that concatenate to the same bytes', async () => {
        expect.assertions(1);
        const [pdaButterfly, pdaButterFly] = await Promise.all([
            getProgramDerivedAddress({
                programAddress: '9PyoV2rqNtoboSvg2JD7GWhM5RQvHGwgdDvK7MCfpgX1' as Address,
                seeds: ['butterfly'],
            }),
            getProgramDerivedAddress({
                programAddress: '9PyoV2rqNtoboSvg2JD7GWhM5RQvHGwgdDvK7MCfpgX1' as Address,
                seeds: ['butter', 'fly'],
            }),
        ]);
        expect(pdaButterfly).toStrictEqual(pdaButterFly);
    });
    // https://solana.stackexchange.com/questions/7253/what-combination-of-program-address-and-seeds-would-cause-findprogramaddress-t
    it.todo(
        'fatals when supplied a combination of program address and seeds for which no off-curve point can be found',
    );
});

describe('createAddressWithSeed', () => {
    it('returns an address that is the SHA-256 hash of the concatenated base address, seed, and program address', async () => {
        expect.assertions(2);
        const baseAddress = 'Bh1uUDP3ApWLeccVNHwyQKpnfGQbuE2UECbGA6M4jiZJ' as Address;
        const programAddress = 'FGrddpvjBUAG6VdV4fR8Q2hEZTHS6w4SEveVBgfwbfdm' as Address;
        const expectedAddress = 'HUKxCeXY6gZohFJFARbLE6L6C9wDEHz1SfK8ENM7QY7z' as Address;

        await expect(createAddressWithSeed({ baseAddress, programAddress, seed: 'seed' })).resolves.toEqual(
            expectedAddress,
        );

        await expect(
            createAddressWithSeed({ baseAddress, programAddress, seed: new Uint8Array([0x73, 0x65, 0x65, 0x64]) }),
        ).resolves.toEqual(expectedAddress);
    });
    it('fails when the seed is longer than 32 bytes', async () => {
        expect.assertions(1);
        const baseAddress = 'Bh1uUDP3ApWLeccVNHwyQKpnfGQbuE2UECbGA6M4jiZJ' as Address;
        const programAddress = 'FGrddpvjBUAG6VdV4fR8Q2hEZTHS6w4SEveVBgfwbfdm' as Address;

        await expect(createAddressWithSeed({ baseAddress, programAddress, seed: 'a'.repeat(33) })).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__ADDRESSES__MAX_PDA_SEED_LENGTH_EXCEEDED, {
                actual: 33,
                index: 0,
                maxSeedLength: 32,
            }),
        );
    });
    it('fails with a malicious programAddress meant to produce an address that would collide with a PDA', async () => {
        expect.assertions(1);
        const baseAddress = 'Bh1uUDP3ApWLeccVNHwyQKpnfGQbuE2UECbGA6M4jiZJ' as Address;
        // The ending bytes of this address decode to the ASCII string 'ProgramDerivedAddress'
        const programAddress = '4vJ9JU1bJJE96FbKdjWme2JfVK1knU936FHTDZV7AC2' as Address;

        await expect(createAddressWithSeed({ baseAddress, programAddress, seed: 'seed' })).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__ADDRESSES__PDA_ENDS_WITH_PDA_MARKER),
        );
    });
});
