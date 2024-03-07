import type { Commitment } from '@solana/rpc-types';

type Config = Readonly<{
    commitmentPropertyName: string;
    optionsObjectPositionInParams: number;
    overrideCommitment?: Commitment;
    params: unknown[];
}>;

export function applyDefaultCommitment({
    commitmentPropertyName,
    params,
    optionsObjectPositionInParams,
    overrideCommitment,
}: Config) {
    const paramInTargetPosition = params[optionsObjectPositionInParams];
    if (
        // There's no config.
        paramInTargetPosition === undefined ||
        // There is a config object.
        (paramInTargetPosition && typeof paramInTargetPosition === 'object' && !Array.isArray(paramInTargetPosition))
    ) {
        if (
            // The config object already has a commitment set.
            paramInTargetPosition &&
            commitmentPropertyName in paramInTargetPosition
        ) {
            if (
                !paramInTargetPosition[commitmentPropertyName as keyof typeof paramInTargetPosition] ||
                paramInTargetPosition[commitmentPropertyName as keyof typeof paramInTargetPosition] === 'finalized'
            ) {
                // Delete the commitment property; `finalized` is already the server default.
                const nextParams = [...params];
                const {
                    [commitmentPropertyName as keyof typeof paramInTargetPosition]: _, // eslint-disable-line @typescript-eslint/no-unused-vars
                    ...rest
                } = paramInTargetPosition;
                if (Object.keys(rest).length > 0) {
                    nextParams[optionsObjectPositionInParams] = rest;
                } else {
                    if (optionsObjectPositionInParams === nextParams.length - 1) {
                        nextParams.length--;
                    } else {
                        nextParams[optionsObjectPositionInParams] = undefined;
                    }
                }
                return nextParams;
            }
        } else if (overrideCommitment !== 'finalized') {
            // Apply the default commitment.
            const nextParams = [...params];
            nextParams[optionsObjectPositionInParams] = {
                ...paramInTargetPosition,
                [commitmentPropertyName]: overrideCommitment,
            };
            return nextParams;
        }
    }
    return params;
}
