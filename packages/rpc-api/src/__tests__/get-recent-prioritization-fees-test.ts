import type { Address } from '@solana/addresses';
import type { Rpc } from '@solana/rpc-spec';

import { GetRecentPrioritizationFeesApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getRecentPrioritizationFees', () => {
    let rpc: Rpc<GetRecentPrioritizationFeesApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    describe('when called with no addresses provided', () => {
        it('returns a list of prioritization fees', async () => {
            expect.assertions(1);
            const res = await rpc.getRecentPrioritizationFees().send();
            expect(Array.isArray(res)).toBe(true);
            // TODO: We have no way to reliably ensure at least one slot
            // has passed at the time of this test, so we can't reliably
            // expect an array that isn't empty.
            //
            // expect(res[0]).toMatchObject({
            //     prioritizationFee: expect.any(BigInt),
            //     slot: expect.any(BigInt),
            // });
        });
    });

    describe('when called with one address provided', () => {
        // TODO: This test does not check whether the response is related to
        // prioritization fees associated with locking the provided account
        it('returns a list of prioritization fees', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            const addresses = ['GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address];
            const res = await rpc.getRecentPrioritizationFees(addresses).send();
            expect(Array.isArray(res)).toBe(true);
            // TODO: We have no way to reliably ensure at least one slot
            // has passed at the time of this test, so we can't reliably
            // expect an array that isn't empty.
            //
            // expect(res[0]).toMatchObject({
            //     prioritizationFee: expect.any(BigInt),
            //     slot: expect.any(BigInt),
            // });
        });
    });

    describe('when called with multiple addresses provided', () => {
        // TODO: This test does not check whether the response is related to
        // prioritization fees associated with locking the provided accounts
        it('returns a list of prioritization fees', async () => {
            expect.assertions(1);
            // See scripts/fixtures/4nTLDQiSTRHbngKZWPMfYnZdWTbKiNeuuPcX7yFUpSAc.json
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            const addresses = [
                '4nTLDQiSTRHbngKZWPMfYnZdWTbKiNeuuPcX7yFUpSAc' as Address,
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address,
            ];
            const res = await rpc.getRecentPrioritizationFees(addresses).send();
            expect(Array.isArray(res)).toBe(true);
            // TODO: We have no way to reliably ensure at least one slot
            // has passed at the time of this test, so we can't reliably
            // expect an array that isn't empty.
            //
            // expect(res[0]).toMatchObject({
            //     prioritizationFee: expect.any(BigInt),
            //     slot: expect.any(BigInt),
            // });
        });
    });

    describe('when called with the address of an account that does not exist', () => {
        // TODO: This test does not check whether the response is related to
        // prioritization fees associated with locking the provided account
        it('returns a list of prioritization fees', async () => {
            expect.assertions(1);
            // Randomly generated
            const addresses = ['BnWCFuxmi6uH3ceVx4R8qcbWBMPVVYVVFWtAiiTA1PAu' as Address];
            const res = await rpc.getRecentPrioritizationFees(addresses).send();
            expect(Array.isArray(res)).toBe(true);
            // TODO: We have no way to reliably ensure at least one slot
            // has passed at the time of this test, so we can't reliably
            // expect an array that isn't empty.
            //
            // expect(res[0]).toMatchObject({
            //     prioritizationFee: expect.any(BigInt),
            //     slot: expect.any(BigInt),
            // });
        });
    });
});
