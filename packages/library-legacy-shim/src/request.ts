/* eslint-disable @typescript-eslint/no-explicit-any */
import { SolanaJSONRPCError } from '@solana/web3.js';
import { create, Struct } from 'superstruct';

interface ShimRequest {
    errorMessage: string;
    responseSchema: Struct<any>;
    send: () => Promise<unknown>;
}

/* Process a request with the v2.0.0 RPC client */
export async function processRequest(request: ShimRequest) {
    let unsafeRes: unknown;
    try {
        unsafeRes = await request.send();
    } catch (e: any) {
        throw new SolanaJSONRPCError(e, request.errorMessage);
    }
    return create(unsafeRes, request.responseSchema);
}
