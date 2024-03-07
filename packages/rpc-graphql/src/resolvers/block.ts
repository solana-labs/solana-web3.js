import type { Commitment, Slot } from '@solana/rpc-types';
import { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { BlockLoaderValue, cacheKeyFn } from '../loaders';
import { buildBlockLoaderArgSetFromResolveInfo, onlyFieldsRequested } from './resolve-info';
import { mapJsonParsedInnerInstructions, mapJsonParsedInstructions, TransactionResult } from './transaction';

type BlockResult = Partial<BlockLoaderValue> & {
    slot: Slot;
    transactionResults?: { [i: number]: TransactionResult };
};

export const resolveBlock = (fieldName?: string) => {
    return async (
        parent: { [x: string]: Slot },
        args: {
            commitment?: Omit<Commitment, 'processed'>;
            slot?: Slot;
        },
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo,
    ) => {
        const slot = fieldName ? parent[fieldName] : args.slot;

        if (slot) {
            if (onlyFieldsRequested(['slot'], info)) {
                return { slot };
            }

            const argsSet = buildBlockLoaderArgSetFromResolveInfo({ ...args, slot }, info);
            const loadedBlocks = await context.loaders.block.loadMany(argsSet);

            let result: BlockResult = {
                slot,
            };

            loadedBlocks.forEach((loadedBlock, i) => {
                if (loadedBlock instanceof Error) {
                    console.error(loadedBlock);
                    return;
                }
                if (loadedBlock === null) {
                    return;
                }
                if (!result.blockhash) {
                    result = {
                        ...result,
                        ...loadedBlock,
                    };
                }
                // @ts-expect-error FIX ME: https://github.com/solana-labs/solana-web3.js/pull/2052
                if (!result.signatures && loadedBlock.signatures) {
                    result = {
                        ...result,
                        // @ts-expect-error FIX ME: https://github.com/solana-labs/solana-web3.js/pull/2052
                        signatures: loadedBlock.signatures,
                    };
                }
                if (!result.transactionResults && loadedBlock.transactions) {
                    result.transactionResults = Array.from({ length: loadedBlock.transactions.length }, (_, i) => ({
                        [i]: { encodedData: {} },
                    }));
                }

                const { transactions } = loadedBlock;
                const { encoding } = argsSet[i];

                if (encoding) {
                    transactions.forEach((loadedTransaction, j) => {
                        const { transaction: data } = loadedTransaction;

                        if (result.transactionResults) {
                            const thisTransactionResult = (result.transactionResults[j] ||= {
                                encodedData: {},
                            });

                            if (Array.isArray(data)) {
                                const thisEncodedData = (thisTransactionResult.encodedData ||= {});
                                thisEncodedData[
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
                                    result.transactionResults[j] = {
                                        ...thisTransactionResult,
                                        ...jsonParsedData,
                                        meta: jsonParsedMeta as unknown as TransactionResult['meta'],
                                    };
                                } else {
                                    result.transactionResults[j] = {
                                        ...thisTransactionResult,
                                        ...jsonParsedData,
                                    };
                                }
                            }
                        }
                    });
                }
            });
            return result;
        }
        return null;
    };
};

export const blockResolvers = {
    Block: {
        transactions: (parent?: BlockResult) =>
            parent?.transactionResults ? Object.values(parent.transactionResults) : null,
    },
};
