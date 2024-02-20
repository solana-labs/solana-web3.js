import type { Slot } from './typed-numbers';

export type SolanaRpcResponse<TValue> = Readonly<{
    context: Readonly<{ slot: Slot }>;
    value: TValue;
}>;
