export type Base58EncodedBytes = string & { readonly __brand: unique symbol };
export type Base64EncodedBytes = string & { readonly __brand: unique symbol };
export type Base64EncodedZStdCompressedBytes = string & { readonly __brand: unique symbol };

export type Base58EncodedDataResponse = [Base58EncodedBytes, 'base58'];
export type Base64EncodedDataResponse = [Base64EncodedBytes, 'base64'];
export type Base64EncodedZStdCompressedDataResponse = [Base64EncodedZStdCompressedBytes, 'base64+zstd'];
