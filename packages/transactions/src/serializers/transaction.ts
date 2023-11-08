import { Codec, combineCodec, Decoder, Encoder, mapDecoder, mapEncoder } from '@solana/codecs-core';
import {
    getArrayDecoder,
    getArrayEncoder,
    getBytesDecoder,
    getBytesEncoder,
    getStructDecoder,
    getStructEncoder,
} from '@solana/codecs-data-structures';
import { getShortU16Decoder, getShortU16Encoder } from '@solana/codecs-numbers';
import { SignatureBytes } from '@solana/keys';

import { CompilableTransaction } from '../compilable-transaction';
import { CompiledTransaction, getCompiledTransaction } from '../compile-transaction';
import { decompileTransaction } from '../decompile-transaction';
import { ITransactionWithSignatures } from '../signatures';
import { getCompiledMessageDecoder, getCompiledMessageEncoder } from './message';

const signaturesDescription = __DEV__ ? 'A compact array of 64-byte, base-64 encoded Ed25519 signatures' : 'signatures';
const transactionDescription = __DEV__ ? 'The wire format of a Solana transaction' : 'transaction';

function getCompiledTransactionEncoder(): Encoder<CompiledTransaction> {
    return getStructEncoder(
        [
            [
                'signatures',
                getArrayEncoder(getBytesEncoder({ size: 64 }), {
                    description: signaturesDescription,
                    size: getShortU16Encoder(),
                }),
            ],
            ['compiledMessage', getCompiledMessageEncoder()],
        ],
        {
            description: transactionDescription,
        }
    );
}

function getSignatureDecoder(): Decoder<SignatureBytes> {
    return mapDecoder(getBytesDecoder({ size: 64 }), bytes => bytes as SignatureBytes);
}

function getCompiledTransactionDecoder(): Decoder<CompiledTransaction> {
    return getStructDecoder(
        [
            [
                'signatures',
                getArrayDecoder(getSignatureDecoder(), {
                    description: signaturesDescription,
                    size: getShortU16Decoder(),
                }),
            ],
            ['compiledMessage', getCompiledMessageDecoder()],
        ],
        {
            description: transactionDescription,
        }
    );
}

export function getTransactionEncoder(): Encoder<
    CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)
> {
    return mapEncoder(getCompiledTransactionEncoder(), getCompiledTransaction);
}

export function getTransactionDecoder(
    lastValidBlockHeight?: bigint
): Decoder<CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)> {
    return mapDecoder(getCompiledTransactionDecoder(), compiledTransaction =>
        decompileTransaction(compiledTransaction, lastValidBlockHeight)
    );
}

export function getTransactionCodec(
    lastValidBlockHeight?: bigint
): Codec<CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)> {
    return combineCodec(getTransactionEncoder(), getTransactionDecoder(lastValidBlockHeight));
}
