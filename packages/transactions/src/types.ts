import { IAccountMeta, IInstruction } from '@solana/instructions';

/** A string of bytes that are definitely a serialized message */
export type SerializedMessageBytes = Uint8Array & { readonly __serializedMessageBytes: unique symbol };
export type SerializedMessageBytesBase64 = string & { readonly __serializedMessageBytesBase64: unique symbol };

export type BaseTransaction<
    TVersion extends TransactionVersion = TransactionVersion,
    TInstruction extends IInstruction = IInstruction,
> = Readonly<{
    instructions: readonly TInstruction[];
    version: TVersion;
}>;

type ILegacyInstruction<TProgramAddress extends string = string> = IInstruction<
    TProgramAddress,
    readonly IAccountMeta[]
>;
type LegacyTransaction = BaseTransaction<'legacy', ILegacyInstruction>;
type V0Transaction = BaseTransaction<0, IInstruction>;

export type Transaction = LegacyTransaction | V0Transaction;
export type TransactionVersion = 'legacy' | 0;
