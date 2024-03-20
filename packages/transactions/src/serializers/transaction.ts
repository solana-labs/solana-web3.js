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

import { CompilableTransaction } from '../compilable-transaction.js';
import { CompiledTransaction, getCompiledTransaction } from '../compile-transaction.js';
import { decompileTransaction, DecompileTransactionConfig } from '../decompile-transaction.js';
import { ITransactionWithSignatures } from '../signatures.js';
import { getCompiledMessageDecoder, getCompiledMessageEncoder } from './message.js';

function getCompiledTransactionEncoder(): VariableSizeEncoder<CompiledTransaction> {
    return getStructEncoder([
        ['signatures', getArrayEncoder(getBytesEncoder({ size: 64 }), { size: getShortU16Encoder() })],
        ['compiledMessage', getCompiledMessageEncoder()],
    ]);
}

export function getCompiledTransactionDecoder(): VariableSizeDecoder<CompiledTransaction> {
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
    config?: DecompileTransactionConfig,
): VariableSizeDecoder<CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)> {
    return mapDecoder(getCompiledTransactionDecoder(), compiledTransaction =>
        decompileTransaction(compiledTransaction, config),
    );
}

export function getTransactionCodec(
    config?: DecompileTransactionConfig,
): VariableSizeCodec<CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)> {
    return combineCodec(getTransactionEncoder(), getTransactionDecoder(config));
}
