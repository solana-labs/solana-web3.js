import type { Slot } from '@solana/rpc-types';
import { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { BlockLoaderArgs, TransactionLoaderArgs } from '../loaders';
import { onlyFieldsRequested } from './resolve-info';

// ====================================
// Removed in next commit
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformParsedInstruction(parsedInstruction: any) {
    if ('parsed' in parsedInstruction) {
        if (typeof parsedInstruction.parsed === 'string' && parsedInstruction.program === 'spl-memo') {
            const { parsed: memo, program: programName, programId } = parsedInstruction;
            const instructionType = 'memo';
            return { instructionType, memo, programId, programName };
        }
        const {
            parsed: { info: data, type: instructionType },
            program: programName,
            programId,
        } = parsedInstruction;
        return { instructionType, programId, programName, ...data };
    } else {
        return parsedInstruction;
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformParsedTransaction(parsedTransaction: any) {
    const transactionData = parsedTransaction.transaction;
    const transactionMeta = parsedTransaction.meta;
    transactionData.message.instructions = transactionData.message.instructions.map(transformParsedInstruction);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transactionMeta.innerInstructions = transactionMeta.innerInstructions.map((innerInstruction: any) => {
        innerInstruction.instructions = innerInstruction.instructions.map(transformParsedInstruction);
        return innerInstruction;
    });
    return [transactionData, transactionMeta];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformLoadedTransaction({
    encoding = 'jsonParsed',
    transaction,
}: {
    encoding: TransactionLoaderArgs['encoding'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: any;
}) {
    const [transactionData, transactionMeta] = Array.isArray(transaction.transaction)
        ? // The requested encoding is base58 or base64.
          [transaction.transaction[0], transaction.meta]
        : // The transaction was either partially parsed or
          // fully JSON-parsed, which will be sorted later.
          transformParsedTransaction(transaction);
    transaction.data = transactionData;
    transaction.encoding = encoding;
    transaction.meta = transactionMeta;
    return transaction;
}
// ====================================

export function transformLoadedBlock({
    block,
    encoding = 'jsonParsed',
    transactionDetails = 'full',
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    block: any;
    encoding: BlockLoaderArgs['encoding'];
    transactionDetails: BlockLoaderArgs['transactionDetails'];
}) {
    const transformedBlock = block;
    if (typeof block === 'object' && 'transactions' in block) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transformedBlock.transactions = block.transactions.map((transaction: any) => {
            if (transactionDetails === 'accounts') {
                return {
                    data: transaction.transaction,
                    meta: transaction.meta,
                    version: transaction.version,
                };
            } else {
                return transformLoadedTransaction({ encoding, transaction });
            }
        });
    }
    block.encoding = encoding;
    block.transactionDetails = transactionDetails;
    return block;
}

export const resolveBlock = (fieldName?: string) => {
    return async (
        parent: { [x: string]: Slot },
        args: BlockLoaderArgs,
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo,
    ) => {
        const slot = fieldName ? parent[fieldName] : args.slot;
        if (!slot) {
            return null;
        }
        if (onlyFieldsRequested(['slot'], info)) {
            return { slot };
        }
        const block = await context.loaders.block.load({ ...args, slot });
        if (block === null) {
            return null;
        }
        const { encoding, transactionDetails } = args;
        return transformLoadedBlock({ block, encoding, transactionDetails });
    };
};

export const blockResolvers = {
    Block: {
        __resolveType(block: { transactionDetails: string }) {
            switch (block.transactionDetails) {
                case 'accounts':
                    return 'BlockWithAccounts';
                case 'none':
                    return 'BlockWithNone';
                case 'signatures':
                    return 'BlockWithSignatures';
                default:
                    return 'BlockWithFull';
            }
        },
    },
};
