import { Commitment } from '../common';

describe('getTokenLargestAccounts', () => {
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            // TODO: will need a way to create token mint + accounts in tests
            it.todo('returns the 20 largest token accounts');
        });
    });
});
