import type { Commitment } from '@solana/rpc-types';

import { applyDefaultCommitment } from '../default-commitment';

const MOCK_COMMITMENT_PROPERTY_NAME = 'commitmentProperty';

describe('applyDefaultCommitment', () => {
    describe.each([0, 1, 2])('in relation to a method whose commitment config is argument #%s', expectedPosition => {
        it('adds the default commitment when absent from the call', () => {
            expect.assertions(1);
            expect(
                applyDefaultCommitment({
                    commitmentPropertyName: MOCK_COMMITMENT_PROPERTY_NAME,
                    optionsObjectPositionInParams: expectedPosition,
                    overrideCommitment: 'processed',
                    params: [],
                }),
            ).toEqual([
                ...new Array(expectedPosition).map(() => expect.anything()),
                { [MOCK_COMMITMENT_PROPERTY_NAME]: 'processed' },
            ]);
        });
        describe.each(['confirmed', 'finalized', 'processed'] as Commitment[])(
            'when the default commitment is set to `%s`',
            defaultCommitment => {
                describe.each(['confirmed', 'processed'])(
                    'and the params already specify a commitment of `%s`',
                    existingCommitment => {
                        it('does not overwrite it', () => {
                            const params = [
                                ...new Array(expectedPosition),
                                { [MOCK_COMMITMENT_PROPERTY_NAME]: existingCommitment },
                            ];
                            expect(
                                applyDefaultCommitment({
                                    commitmentPropertyName: MOCK_COMMITMENT_PROPERTY_NAME,
                                    optionsObjectPositionInParams: expectedPosition,
                                    overrideCommitment: defaultCommitment,
                                    params,
                                }),
                            ).toBe(params);
                        });
                    },
                );
                describe.each(['finalized', undefined])(
                    'and the params already specify a commitment of `%s`',
                    existingCommitment => {
                        it('removes the commitment property when there are other properties in the config object', () => {
                            expect.assertions(1);
                            const params = [
                                ...new Array(expectedPosition),
                                { [MOCK_COMMITMENT_PROPERTY_NAME]: existingCommitment, other: 'property' },
                            ];
                            expect(
                                applyDefaultCommitment({
                                    commitmentPropertyName: MOCK_COMMITMENT_PROPERTY_NAME,
                                    optionsObjectPositionInParams: expectedPosition,
                                    overrideCommitment: defaultCommitment,
                                    params,
                                }),
                            ).toStrictEqual([
                                ...new Array(expectedPosition).map(() => expect.anything()),
                                { other: 'property' },
                            ]);
                        });
                        it('sets the config object to `undefined` when there are no other properties left and the config object is not the last param', () => {
                            expect.assertions(1);
                            const params = [
                                ...new Array(expectedPosition),
                                { [MOCK_COMMITMENT_PROPERTY_NAME]: existingCommitment },
                                'someParam',
                            ];
                            expect(
                                applyDefaultCommitment({
                                    commitmentPropertyName: MOCK_COMMITMENT_PROPERTY_NAME,
                                    optionsObjectPositionInParams: expectedPosition,
                                    overrideCommitment: defaultCommitment,
                                    params,
                                }),
                            ).toStrictEqual([
                                ...new Array(expectedPosition).map(() => expect.anything()),
                                undefined,
                                'someParam',
                            ]);
                        });
                        it('truncates the params when there are no other properties left and the config object is the last param', () => {
                            expect.assertions(1);
                            const params = [
                                ...new Array(expectedPosition),
                                { [MOCK_COMMITMENT_PROPERTY_NAME]: existingCommitment },
                            ];
                            expect(
                                applyDefaultCommitment({
                                    commitmentPropertyName: MOCK_COMMITMENT_PROPERTY_NAME,
                                    optionsObjectPositionInParams: expectedPosition,
                                    overrideCommitment: defaultCommitment,
                                    params,
                                }),
                            ).toStrictEqual([...new Array(expectedPosition).map(() => expect.anything())]);
                        });
                    },
                );
            },
        );
        it.each([null, 1, '1', 1n, [1, 2, 3]])(
            "does not overwrite the existing param when it's a non-object like `%s`",
            paramInConfigPosition => {
                expect.assertions(1);
                const params = [...new Array(expectedPosition), paramInConfigPosition];
                expect(
                    applyDefaultCommitment({
                        commitmentPropertyName: MOCK_COMMITMENT_PROPERTY_NAME,
                        optionsObjectPositionInParams: expectedPosition,
                        overrideCommitment: 'processed',
                        params,
                    }),
                ).toBe(params);
            },
        );
    });
});
