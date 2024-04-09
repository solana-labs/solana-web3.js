import { fixEncoderSize, transformEncoder, VariableSizeEncoder } from '@solana/codecs-core';
import { getArrayEncoder, getBytesEncoder } from '@solana/codecs-data-structures';
import { getShortU16Encoder } from '@solana/codecs-numbers';
import { SOLANA_ERROR__TRANSACTION__CANNOT_ENCODE_WITH_EMPTY_SIGNATURES, SolanaError } from '@solana/errors';
import { SignatureBytes } from '@solana/keys';

import { SignaturesMap } from '../transaction';

function getSignaturesToEncode(signaturesMap: SignaturesMap): SignatureBytes[] {
    const signatures = Object.values(signaturesMap);
    if (signatures.length === 0) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__CANNOT_ENCODE_WITH_EMPTY_SIGNATURES);
    }

    return signatures.map(signature => {
        if (!signature) {
            return new Uint8Array(64).fill(0) as SignatureBytes;
        }
        return signature;
    });
}

export function getSignaturesEncoder(): VariableSizeEncoder<SignaturesMap> {
    return transformEncoder(
        getArrayEncoder(fixEncoderSize(getBytesEncoder(), 64), { size: getShortU16Encoder() }),
        getSignaturesToEncode,
    );
}
