/* eslint-disable @typescript-eslint/no-explicit-any */
import { SolanaRpcMethods } from '@solana/rpc-core';
import DataLoader from 'dataloader';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';
import { GraphQLResolveInfo } from 'graphql';

import type { Rpc } from '../context';
import { TransactionQueryArgs } from '../schema/transaction';
import { onlyPresentFieldRequested } from './common/resolve-info';

function normalizeArgs(args: TransactionQueryArgs) {
    const { commitment, encoding, signature } = args;
    return {
        commitment: commitment ?? 'confirmed',
        encoding: encoding ?? 'jsonParsed',
        // Always use 0 to avoid silly errors
        maxSupportedTransactionVersion: 0,
        signature,
    };
}

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

export async function loadTransaction(rpc: Rpc, { signature, ...config }: ReturnType<typeof normalizeArgs>) {
    const { encoding } = config;

    // If the requested encoding is `base58` or `base64`,
    // first fetch the transaction with the requested encoding,
    // then fetch it again with `jsonParsed` encoding.
    // This ensures the response always has the full transaction meta.
    let transaction = await rpc
        .getTransaction(signature, config as unknown as Parameters<SolanaRpcMethods['getTransaction']>[1])
        .send()
        .catch(e => {
            throw e;
        });
    if (transaction === null) {
        return null;
    }

    if (encoding !== 'jsonParsed') {
        const transactionJsonParsed = await rpc
            .getTransaction(signature, config as unknown as Parameters<SolanaRpcMethods['getTransaction']>[1])
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

    return queryResponse;
}

function createTransactionBatchLoadFn(rpc: Rpc) {
    const resolveTransactionUsingRpc = loadTransaction.bind(null, rpc);
    return async (transactionQueryArgs: readonly ReturnType<typeof normalizeArgs>[]) => {
        return await Promise.all(transactionQueryArgs.map(async args => await resolveTransactionUsingRpc(args)));
    };
}

export function createTransactionLoader(rpc: Rpc) {
    const loader = new DataLoader(createTransactionBatchLoadFn(rpc), { cacheKeyFn: fastStableStringify });
    return {
        load: async (args: TransactionQueryArgs, info?: GraphQLResolveInfo) => {
            // If a user only requests the transaction's signature, don't call the RPC or the cache
            if (onlyPresentFieldRequested('signature', info)) {
                return { signature: args.signature };
            }
            return loader.load(normalizeArgs(args));
        },
    };
}
