import type { Commitment } from '@solana/rpc-types';

import { getDefaultParamsTransformerForSolanaRpc } from '../params-transformer';
import { OPTIONS_OBJECT_POSITION_BY_METHOD } from '../params-transformer-options-object-position-config';

describe('getDefaultParamsTransformerForSolanaRpc', () => {
    describe('given no config', () => {
        let paramsTransformer: (value: unknown) => unknown;
        beforeEach(() => {
            const patcher = getDefaultParamsTransformerForSolanaRpc();
            paramsTransformer = value => patcher(value, 'getFoo' /* methodName */);
        });
        describe('given an array as input', () => {
            const input = [10n, 10, '10', ['10', [10, 10n], 10n]] as const;
            it('casts the bigints in the array to a `number`, recursively', () => {
                expect(paramsTransformer(input)).toStrictEqual([
                    Number(input[0]),
                    input[1],
                    input[2],
                    [input[3][0], [input[3][1][0], Number(input[3][1][0])], Number(input[3][2])],
                ]);
            });
        });
        describe('given an object as input', () => {
            const input = { a: 10n, b: 10, c: { c1: '10', c2: 10n } } as const;
            it('casts the bigints in the array to a `number`, recursively', () => {
                expect(paramsTransformer(input)).toStrictEqual({
                    a: Number(input.a),
                    b: input.b,
                    c: { c1: input.c.c1, c2: Number(input.c.c2) },
                });
            });
        });
    });
    describe('with respect to the default commitment', () => {
        const METHODS_SUBJECT_TO_COMMITMENT_DEFAULTING = [
            'accountNotifications',
            'blockNotifications',
            'getAccountInfo',
            'getBalance',
            'getBlock',
            'getBlockHeight',
            'getBlockProduction',
            'getBlocks',
            'getBlocksWithLimit',
            'getConfirmedBlock',
            'getConfirmedBlocks',
            'getConfirmedBlocksWithLimit',
            'getConfirmedSignaturesForAddress2',
            'getConfirmedTransaction',
            'getEpochInfo',
            'getFeeCalculatorForBlockhash',
            'getFeeForMessage',
            'getFees',
            'getInflationGovernor',
            'getInflationReward',
            'getLargestAccounts',
            'getLatestBlockhash',
            'getLeaderSchedule',
            'getMinimumBalanceForRentExemption',
            'getMultipleAccounts',
            'getProgramAccounts',
            'getRecentBlockhash',
            'getSignaturesForAddress',
            'getSlot',
            'getSlotLeader',
            'getStakeActivation',
            'getStakeMinimumDelegation',
            'getSupply',
            'getTokenAccountBalance',
            'getTokenAccountsByDelegate',
            'getTokenAccountsByOwner',
            'getTokenLargestAccounts',
            'getTokenSupply',
            'getTransaction',
            'getTransactionCount',
            'getVoteAccounts',
            'isBlockhashValid',
            'logsNotifications',
            'programNotifications',
            'requestAirdrop',
            'signatureNotifications',
            'simulateTransaction',
        ];
        describe.each(['processed', 'confirmed'] as Commitment[])(
            'with the default commitment set to `%s`',
            defaultCommitment => {
                let patcher: ReturnType<typeof getDefaultParamsTransformerForSolanaRpc>;
                beforeEach(() => {
                    patcher = getDefaultParamsTransformerForSolanaRpc({ defaultCommitment });
                });
                it.each(METHODS_SUBJECT_TO_COMMITMENT_DEFAULTING)(
                    'adds a default commitment on calls for `%s`',
                    methodName => {
                        expect(patcher([], methodName)).toContainEqual({ commitment: defaultCommitment });
                    },
                );
                it('adds a default preflight commitment on calls to `sendTransaction`', () => {
                    expect(patcher([], 'sendTransaction')).toContainEqual({ preflightCommitment: defaultCommitment });
                });
            },
        );
        describe('with the default commitment set to `finalized`', () => {
            let patcher: ReturnType<typeof getDefaultParamsTransformerForSolanaRpc>;
            beforeEach(() => {
                patcher = getDefaultParamsTransformerForSolanaRpc({ defaultCommitment: 'finalized' });
            });
            it.each(METHODS_SUBJECT_TO_COMMITMENT_DEFAULTING)('adds no commitment on calls for `%s`', methodName => {
                expect(patcher([], methodName)).not.toContainEqual(
                    expect.objectContaining({ commitment: expect.anything() }),
                );
            });
            it('adds no preflight commitment on calls to `sendTransaction`', () => {
                expect(patcher([], 'sendTransaction')).not.toContainEqual(
                    expect.objectContaining({ preflightCommitment: expect.anything() }),
                );
            });
        });
        describe('with no default commitment set', () => {
            let patcher: ReturnType<typeof getDefaultParamsTransformerForSolanaRpc>;
            beforeEach(() => {
                patcher = getDefaultParamsTransformerForSolanaRpc();
            });
            it.each(METHODS_SUBJECT_TO_COMMITMENT_DEFAULTING)('sets no commitment on calls to `%s`', methodName => {
                expect(patcher([], methodName)).not.toContainEqual(
                    expect.objectContaining({ commitment: expect.anything() }),
                );
            });
            it('adds no preflight commitment on calls to `sendTransaction`', () => {
                expect(patcher([], 'sendTransaction')).not.toContainEqual(
                    expect.objectContaining({ preflightCommitment: expect.anything() }),
                );
            });
        });
        describe.each(['finalized', undefined])(
            'when the params already specify a commitment of `%s`',
            existingCommitment => {
                describe.each(METHODS_SUBJECT_TO_COMMITMENT_DEFAULTING)('on calls to `%s`', methodName => {
                    const optionsObjectPosition = OPTIONS_OBJECT_POSITION_BY_METHOD[methodName]!;
                    it('removes the commitment property on calls to `%s` when there are other properties in the config object', () => {
                        expect.assertions(1);
                        const params = [
                            ...new Array(optionsObjectPosition),
                            { commitment: existingCommitment, other: 'property' },
                        ];
                        const patcher = getDefaultParamsTransformerForSolanaRpc();
                        expect(patcher(params, methodName)).toStrictEqual([
                            ...new Array(optionsObjectPosition).map(() => expect.anything()),
                            { other: 'property' },
                        ]);
                    });
                    it('deletes the commitment on calls to `%s` when there are no other properties left and the config object is not the last param', () => {
                        expect.assertions(1);
                        const params = [
                            ...new Array(optionsObjectPosition),
                            { commitment: existingCommitment },
                            'someParam',
                        ];
                        const patcher = getDefaultParamsTransformerForSolanaRpc();
                        expect(patcher(params, methodName)).toStrictEqual([
                            ...new Array(optionsObjectPosition).map(() => expect.anything()),
                            undefined,
                            'someParam',
                        ]);
                    });
                    it('truncates the params on calls to `%s` when there are no other properties left and the config object is the last param', () => {
                        expect.assertions(1);
                        const params = [...new Array(optionsObjectPosition), { commitment: existingCommitment }];
                        const patcher = getDefaultParamsTransformerForSolanaRpc();
                        expect(patcher(params, methodName)).toStrictEqual([
                            ...new Array(optionsObjectPosition).map(() => expect.anything()),
                        ]);
                    });
                });
                it('removes the preflight commitment property on calls to `%s` when there are other properties in the config object', () => {
                    expect.assertions(1);
                    const optionsObjectPosition = OPTIONS_OBJECT_POSITION_BY_METHOD['sendTransaction']!;
                    const params = [
                        ...new Array(optionsObjectPosition),
                        { other: 'property', preflightCommitment: existingCommitment },
                    ];
                    const patcher = getDefaultParamsTransformerForSolanaRpc();
                    expect(patcher(params, 'sendTransaction')).toStrictEqual([
                        ...new Array(optionsObjectPosition).map(() => expect.anything()),
                        { other: 'property' },
                    ]);
                });
                it('deletes the preflight commitment on calls to `%s` when there are no other properties left and the config object is not the last param', () => {
                    expect.assertions(1);
                    const optionsObjectPosition = OPTIONS_OBJECT_POSITION_BY_METHOD['sendTransaction']!;
                    const params = [
                        ...new Array(optionsObjectPosition),
                        { preflightCommitment: existingCommitment },
                        'someParam',
                    ];
                    const patcher = getDefaultParamsTransformerForSolanaRpc();
                    expect(patcher(params, 'sendTransaction')).toStrictEqual([
                        ...new Array(optionsObjectPosition).map(() => expect.anything()),
                        undefined,
                        'someParam',
                    ]);
                });
                it('truncates the params on calls to `%s` when there are no other properties left and the config object is the last param', () => {
                    expect.assertions(1);
                    const optionsObjectPosition = OPTIONS_OBJECT_POSITION_BY_METHOD['sendTransaction']!;
                    const params = [...new Array(optionsObjectPosition), { preflightCommitment: existingCommitment }];
                    const patcher = getDefaultParamsTransformerForSolanaRpc();
                    expect(patcher(params, 'sendTransaction')).toStrictEqual([
                        ...new Array(optionsObjectPosition).map(() => expect.anything()),
                    ]);
                });
            },
        );
    });
    // FIXME Remove when https://github.com/anza-xyz/agave/pull/483 is deployed.
    it.each([undefined, 'processed', 'confirmed', 'finalized'])(
        'sets the `preflightCommitment` to `processed` when `skipPreflight` is `true` and `preflightCommitment` is `%s` on calls to `sendTransaction`',
        explicitPreflightCommitment => {
            const patcher = getDefaultParamsTransformerForSolanaRpc();
            expect(
                patcher(
                    [
                        null,
                        {
                            // eslint-disable-next-line jest/no-conditional-in-test
                            ...(explicitPreflightCommitment
                                ? { preflightCommitment: explicitPreflightCommitment }
                                : null),
                            skipPreflight: true,
                        },
                    ],
                    'sendTransaction',
                ),
            ).toContainEqual(expect.objectContaining({ preflightCommitment: 'processed' }));
        },
    );
    describe('given an integer overflow handler', () => {
        let onIntegerOverflow: jest.Mock;
        let paramsTransformer: (value: unknown) => unknown;
        beforeEach(() => {
            onIntegerOverflow = jest.fn();
            const patcher = getDefaultParamsTransformerForSolanaRpc({ onIntegerOverflow });
            paramsTransformer = value => patcher(value, 'getFoo' /* methodName */);
        });
        Object.entries({
            'value above `Number.MAX_SAFE_INTEGER`': BigInt(Number.MAX_SAFE_INTEGER) + 1n,
            'value below `Number.MAX_SAFE_INTEGER`': -BigInt(Number.MAX_SAFE_INTEGER) - 1n,
        }).forEach(([description, value]) => {
            it('calls `onIntegerOverflow` when passed a value ' + description, () => {
                paramsTransformer(value);
                expect(onIntegerOverflow).toHaveBeenCalledWith(
                    'getFoo',
                    [], // Equivalent to `params`
                    value,
                );
            });
            it('calls `onIntegerOverflow` when passed a nested array having a value ' + description, () => {
                paramsTransformer([1, 2, [3, value]]);
                expect(onIntegerOverflow).toHaveBeenCalledWith(
                    'getFoo',
                    [2, 1], // Equivalent to `params[2][1]`.
                    value,
                );
            });
            it('calls `onIntegerOverflow` when passed a nested object having a value ' + description, () => {
                paramsTransformer({ a: 1, b: { b1: 2, b2: value } });
                expect(onIntegerOverflow).toHaveBeenCalledWith(
                    'getFoo',
                    ['b', 'b2'], // Equivalent to `params.b.b2`.
                    value,
                );
            });
            it('does not call `onIntegerOverflow` when passed `Number.MAX_SAFE_INTEGER`', () => {
                paramsTransformer(BigInt(Number.MAX_SAFE_INTEGER));
                expect(onIntegerOverflow).not.toHaveBeenCalled();
            });
        });
    });
});
