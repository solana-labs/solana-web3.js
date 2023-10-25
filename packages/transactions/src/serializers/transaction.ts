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
import { Ed25519Signature } from '@solana/keys';

import { getCompiledTransaction } from '../compile-transaction';
import { decompileTransaction } from '../decompile-transaction';
import { compileMessage } from '../message';
import { ITransactionWithSignatures } from '../signatures';
import { getCompiledMessageDecoder, getCompiledMessageEncoder } from './message';

type CompilableTransaction = Parameters<typeof compileMessage>[0];
type CompiledTransaction = ReturnType<typeof getCompiledTransaction>;

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

function getSignatureDecoder(): Decoder<Ed25519Signature> {
    return mapDecoder(getBytesDecoder({ size: 64 }), bytes => bytes as Ed25519Signature);
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
