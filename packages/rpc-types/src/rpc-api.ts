import type { Slot } from './typed-numbers.js';

export type SolanaRpcResponse<TValue> = Readonly<{
    context: Readonly<{ slot: Slot }>;
    value: TValue;
}>;
