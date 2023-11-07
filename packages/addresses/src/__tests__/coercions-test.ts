import { Address, address } from '../address';

describe('coercions', () => {
    describe('address', () => {
        it('can coerce to `Address`', () => {
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            const raw =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;
            const coerced = address('GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G');
            expect(coerced).toBe(raw);
        });
        it('throws on invalid `Address`', () => {
            const thisThrows = () => address('3333333333333333');
            expect(thisThrows).toThrow('`3333333333333333` is not a base-58 encoded address');
        });
    });
});
