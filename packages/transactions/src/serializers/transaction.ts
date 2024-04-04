import {
    combineCodec,
    fixDecoderSize,
    FixedSizeDecoder,
    fixEncoderSize,
    transformDecoder,
    transformEncoder,
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
import { decompileTransaction, DecompileTransactionConfig } from '../decompile-transaction';
import { ITransactionWithSignatures } from '../signatures';
import { getCompiledMessageDecoder, getCompiledMessageEncoder } from './message';

function getCompiledTransactionEncoder(): VariableSizeEncoder<CompiledTransaction> {
    return getStructEncoder([
        ['signatures', getArrayEncoder(fixEncoderSize(getBytesEncoder(), 64), { size: getShortU16Encoder() })],
        ['compiledMessage', getCompiledMessageEncoder()],
    ]);
}

export function getCompiledTransactionDecoder(): VariableSizeDecoder<CompiledTransaction> {
    return getStructDecoder([
        [
            'signatures',
            getArrayDecoder(fixDecoderSize(getBytesDecoder(), 64) as FixedSizeDecoder<SignatureBytes, 64>, {
                size: getShortU16Decoder(),
            }),
        ],
        ['compiledMessage', getCompiledMessageDecoder()],
    ]);
}

export function getTransactionEncoder(): VariableSizeEncoder<
    CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)
> {
    return transformEncoder(getCompiledTransactionEncoder(), getCompiledTransaction);
}

export function getTransactionDecoder(
    config?: DecompileTransactionConfig,
): VariableSizeDecoder<CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)> {
    return transformDecoder(getCompiledTransactionDecoder(), compiledTransaction =>
        decompileTransaction(compiledTransaction, config),
    );
}

export function getTransactionCodec(
    config?: DecompileTransactionConfig,
): VariableSizeCodec<CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)> {
    return combineCodec(getTransactionEncoder(), getTransactionDecoder(config));
}
