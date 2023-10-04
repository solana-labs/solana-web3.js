export type Base64EncodedWireTransaction = string & {
    readonly __brand: unique symbol;
};
export type Commitment = 'confirmed' | 'finalized' | 'processed';
/** A string of bytes that are definitely a serialized message */
export type SerializedMessageBytesBase64 = string & { readonly __serializedMessageBytesBase64: unique symbol };
export type TransactionVersion = 'legacy' | 0;
