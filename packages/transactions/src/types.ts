import { IAccountMeta, IInstruction } from '@solana/instructions';

/** A string of bytes that are definitely a serialized message */
export type SerializedMessageBytes = Uint8Array & { readonly __serializedMessageBytes: unique symbol };
export type SerializedMessageBytesBase64 = string & { readonly __serializedMessageBytesBase64: unique symbol };

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
export type TransactionVersion = 'legacy' | 0;
