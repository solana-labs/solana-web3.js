import { Commitment } from '@solana/rpc-types';

// TODO: We're experiencing some choppiness in the CI pipeline that seems to
// revolve around this test. Until we can narrow down the cause, we'll skip it.
describe('getLeaderSchedule', () => {
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            describe('when called with no identity and no slot', () => {
                it.todo('returns the leader schedule for all cluster nodes in the current epoch');
            });

            describe('when called with no identity and a valid slot', () => {
                it.todo(
                    'returns the leader schedule for all cluster nodes in the epoch corresponding to the provided slot',
                );
            });

            describe('when called with an account that is a validator identity and no slot', () => {
                it.todo('returns the leader schedule for only the specified node in the current epoch');
            });

            describe('when called with an account that is a validator identity and a valid slot', () => {
                it.todo(
                    'returns the leader schedule for only the specified node in the epoch corresponding to the provided slot',
                );
            });
        });

        describe('given an account that exists but is not a validator identity', () => {
            it.todo('returns an empty object');
        });

        describe('given an account that does not exist', () => {
            it.todo('returns an empty object');
        });

        describe('given an invalid slot', () => {
            it.todo('returns an empty object');
        });
    });
});
