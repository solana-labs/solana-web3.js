import { Commitment, commitmentComparator } from '../commitment';

describe('commitmentComparator', () => {
    it('sorts commitments according to their level of finality ascending', () => {
        expect((['finalized', 'processed', 'confirmed'] as Commitment[]).sort(commitmentComparator)).toEqual([
            'processed',
            'confirmed',
            'finalized',
        ]);
    });
});
