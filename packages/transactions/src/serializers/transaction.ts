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
import { decompileTransactionMessage, DecompileTransactionMessageConfig } from '@solana/transaction-messages';

import { CompilableTransaction } from '../compilable-transaction';
import { CompiledTransaction, getCompiledTransaction } from '../compile-transaction';
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
    config?: DecompileTransactionMessageConfig,
): VariableSizeDecoder<CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)> {
    return transformDecoder(getCompiledTransactionDecoder(), compiledTransaction =>
        tempDecompileTransaction(compiledTransaction, config),
    );
}

export function getTransactionCodec(
    config?: DecompileTransactionMessageConfig,
): VariableSizeCodec<CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)> {
    return combineCodec(getTransactionEncoder(), getTransactionDecoder(config));
}

// temporary adapter from decompileMessage to our old decompileTransaction
// temporary because this serializer will be removed eventually!
function tempDecompileTransaction(
    compiledTransaction: CompiledTransaction,
    config?: DecompileTransactionMessageConfig,
): CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures) {
    const message = decompileTransactionMessage(compiledTransaction.compiledMessage, config);
    const signatures = convertSignatures(compiledTransaction);

    const out = Object.keys(signatures).length > 0 ? { ...message, signatures } : message;
    return out as CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures);
}

// copied from decompile-transaction,
// which has moved to transaction-messages as decompile-message
function convertSignatures(compiledTransaction: CompiledTransaction): ITransactionWithSignatures['signatures'] {
    const {
        compiledMessage: { staticAccounts },
        signatures,
    } = compiledTransaction;
    return signatures.reduce((acc, sig, index) => {
        // compiled transaction includes a fake all 0 signature if it hasn't been signed
        // we don't store those for the ITransactionWithSignatures model. So just skip if it's all 0s
        const allZeros = sig.every(byte => byte === 0);
        if (allZeros) return acc;

        const address = staticAccounts[index];
        return { ...acc, [address]: sig as SignatureBytes };
    }, {});
}
