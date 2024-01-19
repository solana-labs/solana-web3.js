import { Signature } from '@solana/keys';
import type { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { TransactionLoaderArgs } from '../loaders';
import { onlyFieldsRequested } from './resolve-info';

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

export function resolveTransaction(fieldName?: string) {
    return async (
        parent: { [x: string]: Signature },
        args: TransactionLoaderArgs,
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo,
    ) => {
        const signature = fieldName ? parent[fieldName] : args.signature;
        if (!signature) {
            return null;
        }
        if (onlyFieldsRequested(['signature'], info)) {
            return { signature };
        }
        const transaction = await context.loaders.transaction.load({ ...args, signature });
        if (!transaction) {
            return null;
        }
        // If the requested encoding is `base58` or `base64`,
        // first fetch the transaction with the requested encoding,
        // then fetch it again with `jsonParsed` encoding.
        // This ensures the response always has the full transaction meta.
        if (args.encoding !== 'jsonParsed') {
            const transactionJsonParsed = await context.loaders.transaction.load({
                ...args,
                encoding: 'jsonParsed',
                signature,
            });
            if (transactionJsonParsed === null) {
                return null;
            }
            transaction.meta = transactionJsonParsed.meta;
        }
        return transformLoadedTransaction({ encoding: args.encoding, transaction });
    };
}

export const transactionResolvers = {
    Transaction: {
        __resolveType(transaction: { encoding: string }) {
            switch (transaction.encoding) {
                case 'base58':
                    return 'TransactionBase58';
                case 'base64':
                    return 'TransactionBase64';
                default:
                    return 'TransactionParsed';
            }
        },
    },
};
