import {
    combineCodec,
    FixedSizeDecoder,
    mapDecoder,
    mapEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
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

function getCompiledTransactionEncoder(): VariableSizeEncoder<CompiledTransaction> {
    return getStructEncoder([
        ['signatures', getArrayEncoder(getBytesEncoder({ size: 64 }), { size: getShortU16Encoder() })],
        ['compiledMessage', getCompiledMessageEncoder()],
    ]);
}

function getCompiledTransactionDecoder(): VariableSizeDecoder<CompiledTransaction> {
    return getStructDecoder([
        [
            'signatures',
            getArrayDecoder(getBytesDecoder({ size: 64 }) as FixedSizeDecoder<SignatureBytes, 64>, {
                size: getShortU16Decoder(),
            }),
        ],
        ['compiledMessage', getCompiledMessageDecoder()],
    ]);
}

export function getTransactionEncoder(): VariableSizeEncoder<
    CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)
> {
    return mapEncoder(getCompiledTransactionEncoder(), getCompiledTransaction);
}

export function getTransactionDecoder(
    lastValidBlockHeight?: bigint,
): VariableSizeDecoder<CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)> {
    return mapDecoder(getCompiledTransactionDecoder(), compiledTransaction =>
        decompileTransaction(compiledTransaction, lastValidBlockHeight),
    );
}

export function getTransactionCodec(
    lastValidBlockHeight?: bigint,
): VariableSizeCodec<CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)> {
    return combineCodec(getTransactionEncoder(), getTransactionDecoder(lastValidBlockHeight));
}
