import { SolanaRpcMethods } from '@solana/rpc-core';
import { GraphQLResolveInfo } from 'graphql';

import { GraphQLCache } from '../cache';
import type { Rpc } from '../context';
import { TransactionQueryArgs } from '../schema/transaction';

function normalizeArgs(args: Omit<TransactionQueryArgs, 'signature'>) {
    const { commitment, encoding } = args;
    return {
        commitment: commitment ?? 'confirmed',
        encoding: encoding ?? 'jsonParsed',
        // Always use 0 to avoid silly errors
        maxSupportedTransactionVersion: 0,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function refineJsonParsedInstructionData(jsonParsedInstructionData: any) {
    if ('parsed' in jsonParsedInstructionData) {
        const meta = {
            program: jsonParsedInstructionData.program,
            type: jsonParsedInstructionData.parsed.type,
        };
        const programId = jsonParsedInstructionData.programId;
        const data = jsonParsedInstructionData.parsed.info;
        return { data, meta, programId };
    } else {
        return jsonParsedInstructionData;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function refineJsonParsedTransactionData(jsonParsedTransactionData: any) {
    const refinedInstructions = jsonParsedTransactionData.message.instructions.map((instruction: unknown) =>
        refineJsonParsedInstructionData(instruction)
    );
    const message = {
        ...jsonParsedTransactionData.message,
        instructions: refinedInstructions,
    };
    return { message, signatures: jsonParsedTransactionData.signatures };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function refineJsonParsedTransactionMeta(jsonParsedTransactionMeta: any) {
    const refinedInnerInstructions = jsonParsedTransactionMeta.innerInstructions.map(
        ({ index, instructions }: { index: number; instructions: unknown[] }) => {
            return {
                index,
                instructions: instructions.map((instruction: unknown) => refineJsonParsedInstructionData(instruction)),
            };
        }
    );
    return {
        ...jsonParsedTransactionMeta,
        innerInstructions: refinedInnerInstructions,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function refineJsonParsedTransaction({ encoding, transaction }: { encoding: string; transaction: any }) {
    const [transactionData, transactionMeta] = Array.isArray(transaction.transaction)
        ? [transaction.transaction[0], transaction.meta]
        : [refineJsonParsedTransactionData(transaction.transaction), refineJsonParsedTransactionMeta(transaction.meta)];
    return {
        data: transactionData,
        encoding,
        meta: transactionMeta,
        slot: transaction.slot,
        version: transaction.version,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processQueryResponse({ encoding, transaction }: { encoding: string; transaction: any }) {
    return refineJsonParsedTransaction({ encoding, transaction });
}

export async function loadTransaction(
    { signature, ...config }: TransactionQueryArgs,
    cache: GraphQLCache,
    rpc: Rpc,
    _info?: GraphQLResolveInfo
) {
    const requestConfig = normalizeArgs(config);
    const { encoding } = requestConfig;

    const cached = cache.get(signature, requestConfig);
    if (cached !== null) {
        return cached;
    }

    // If the requested encoding is `base58` or `base64`,
    // first fetch the transaction with the requested encoding,
    // then fetch it again with `jsonParsed` encoding.
    // This ensures the response always has the full transaction meta.
    let transaction = await rpc
        .getTransaction(signature, requestConfig as unknown as Parameters<SolanaRpcMethods['getTransaction']>[1])
        .send()
        .catch(e => {
            throw e;
        });
    if (transaction === null) {
        return null;
    }

    if (encoding !== 'jsonParsed') {
        const transactionJsonParsed = await rpc
            .getTransaction(signature, requestConfig as unknown as Parameters<SolanaRpcMethods['getTransaction']>[1])
            .send()
            .catch(e => {
                throw e;
            });
        if (transactionJsonParsed === null) {
            return null;
        }
        transaction = {
            ...transaction,
            meta: transactionJsonParsed.meta,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
    }

    const queryResponse = processQueryResponse({ encoding, transaction });

    cache.insert(signature, requestConfig, queryResponse);

    return queryResponse;
}
