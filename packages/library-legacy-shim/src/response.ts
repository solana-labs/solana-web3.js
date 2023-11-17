import { PublicKey } from '@solana/web3.js';
import {
    any,
    array,
    coerce,
    create,
    instance,
    literal,
    nullable,
    number,
    optional,
    string,
    Struct,
    type as pick,
    union,
    unknown,
} from 'superstruct';

const PublicKeyFromString = coerce(instance(PublicKey), string(), value => new PublicKey(value));

/**
 * @internal
 */
function createRpcResult<T, U>(result: Struct<T, U>) {
    return union([
        pick({
            id: string(),
            jsonrpc: literal('2.0'),
            result,
        }),
        pick({
            error: pick({
                code: unknown(),
                data: optional(any()),
                message: string(),
            }),
            id: string(),
            jsonrpc: literal('2.0'),
        }),
    ]);
}
const UnknownRpcResult = createRpcResult(unknown());

/**
 * @internal
 * Since the experimental Web3 JS RPC API no longer returns `jsonrpc` and `id`,
 * we don't want to try to coerce them into the schema, since all methods
 * of the `Connection` class trim these fields off of their responses anyway.
 */
function result<T, U>(schema: Struct<T, U>) {
    /**
     * Errors processing requests from the RPC are handled internally
     * by the new experimental Web3 JS RPC API, so we no longer need to
     * check for an `error` field in the response, nor propogate it to the
     * `Connection` class's methods.
     */
    return coerce(schema, UnknownRpcResult, value => create(value, schema));
}

/**
 * @internal
 */
function resultAndContext<T, U>(value: Struct<T, U>) {
    return result(
        pick({
            context: pick({
                slot: number(),
            }),
            value,
        })
    );
}

export const responseSchemaGetBlockTime = result(nullable(number()));
export const responseSchemaGetFirstAvailableBlock = result(number());
export const responseSchemaMinimumLedgerSlot = result(number());
export const responseSchemaGetSupply = resultAndContext(
    pick({
        circulating: number(),
        nonCirculating: number(),
        nonCirculatingAccounts: array(PublicKeyFromString),
        total: number(),
    })
);
