import { Address } from '@solana/addresses';
import { Signature } from '@solana/keys';
import { Commitment } from '@solana/rpc-types';
import type { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { cacheKeyFn, TransactionLoaderValue } from '../loaders';
import { buildTransactionLoaderArgSetFromResolveInfo, onlyFieldsRequested } from './resolve-info';

export type EncodedTransactionData = {
    [key: string]: string;
};

export type InstructionResult = {
    [key: string]: unknown;
} & {
    jsonParsedConfigs?: {
        instructionType: string;
        programId: Address;
        programName: string;
    };
    programId?: Address;
};

export type TransactionResult = Partial<TransactionLoaderValue> & {
    encodedData?: EncodedTransactionData;
    signature?: Signature;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapJsonParsedInstructions(instructions: readonly any[]): InstructionResult[] {
    return instructions.map(instruction => {
        if ('parsed' in instruction) {
            // `jsonParsed`
            if (typeof instruction.parsed === 'string' && instruction.program === 'spl-memo') {
                const { parsed: memo, program: programName, programId } = instruction;
                const instructionType = 'memo';
                const jsonParsedConfigs = {
                    instructionType,
                    programId,
                    programName,
                };
                return { jsonParsedConfigs, memo, programId };
            }
            const {
                parsed: { info: data, type: instructionType },
                program: programName,
                programId,
            } = instruction;
            const jsonParsedConfigs = {
                instructionType,
                programId,
                programName,
            };
            return { jsonParsedConfigs, ...data, programId };
        } else {
            // `json`
            return instruction;
        }
    });
}

export function mapJsonParsedInnerInstructions(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    innerInstructions: readonly any[],
): { index: number; instructions: InstructionResult[] }[] {
    return innerInstructions.map(({ index, instructions }) => ({
        index,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        instructions: mapJsonParsedInstructions(instructions),
    }));
}

const resolveTransactionData = () => {
    return (
        parent: TransactionResult | null,
        args: {
            encoding: 'base58' | 'base64';
        },
    ) => {
        return parent === null ? null : parent.encodedData ? parent.encodedData[cacheKeyFn(args)] : null;
    };
};

export function resolveTransaction(fieldName?: string) {
    return async (
        parent: { [x: string]: Signature },
        args: {
            commitment?: Omit<Commitment, 'processed'>;
            signature?: Signature;
        },
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo,
    ): Promise<TransactionResult | null> => {
        const signature = fieldName ? parent[fieldName] : args.signature;

        if (signature) {
            if (onlyFieldsRequested(['signature'], info)) {
                return { signature };
            }

            const argsSet = buildTransactionLoaderArgSetFromResolveInfo({ ...args, signature }, info);
            const loadedTransactions = await context.loaders.transaction.loadMany(argsSet);

            let result: TransactionResult = {
                encodedData: {},
                signature,
            };

            loadedTransactions.forEach((loadedTransaction, i) => {
                if (loadedTransaction instanceof Error) {
                    console.error(loadedTransaction);
                    return;
                }
                if (loadedTransaction === null) {
                    return;
                }
                if (!result.slot) {
                    result = {
                        ...result,
                        ...loadedTransaction,
                    };
                }

                const { transaction: data } = loadedTransaction;
                const { encoding } = argsSet[i];

                if (encoding && result.encodedData) {
                    if (Array.isArray(data)) {
                        result.encodedData[
                            cacheKeyFn({
                                encoding,
                            })
                        ] = data[0];
                    } else if (typeof data === 'object') {
                        const jsonParsedData = data;
                        jsonParsedData.message.instructions = mapJsonParsedInstructions(
                            jsonParsedData.message.instructions,
                        ) as unknown as (typeof jsonParsedData)['message']['instructions'];

                        const loadedInnerInstructions = loadedTransaction.meta?.innerInstructions;
                        if (loadedInnerInstructions) {
                            const innerInstructions = mapJsonParsedInnerInstructions(loadedInnerInstructions);
                            const jsonParsedMeta = {
                                ...loadedTransaction.meta,
                                innerInstructions,
                            };
                            result = {
                                ...result,
                                ...jsonParsedData,
                                meta: jsonParsedMeta as unknown as (typeof loadedTransaction)['meta'],
                            };
                        } else {
                            result = {
                                ...result,
                                ...jsonParsedData,
                            };
                        }
                    }
                }
            });
            return result;
        }
        return null;
    };
}

export const transactionResolvers = {
    Transaction: {
        data: resolveTransactionData(),
    },
};
