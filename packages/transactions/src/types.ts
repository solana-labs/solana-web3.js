import { IAccountMeta, IInstruction } from '@solana/instructions';
import { TransactionVersion } from 'types';

/** A string of bytes that are definitely a serialized message */
export type SerializedMessageBytes = Uint8Array & { readonly __serializedMessageBytes: unique symbol };

export type BaseTransaction = Readonly<{
    instructions: readonly IInstruction[];
    version: TransactionVersion;
}>;

type LegacyTransaction = BaseTransaction &
    Readonly<{
        instructions: readonly (Omit<IInstruction, 'accounts'> &
            Readonly<{ readonly accounts?: readonly IAccountMeta[] }>)[];
        version: 'legacy';
    }>;

type V0Transaction = BaseTransaction &
    Readonly<{
        instructions: readonly IInstruction[];
        version: 0;
    }>;

export type Transaction = LegacyTransaction | V0Transaction;
