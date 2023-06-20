import { Base58EncodedAddress } from '@solana/keys';

type Base64EncodedSignature = string & {
    readonly __base64EncodedSignature: unique symbol;
};
export interface IFullySignedTransaction extends ITransactionWithSignatures {
    readonly __fullySignedTransaction: unique symbol;
}
export interface ITransactionWithSignatures {
    readonly signatures: Readonly<Record<Base58EncodedAddress, Base64EncodedSignature>>;
}
