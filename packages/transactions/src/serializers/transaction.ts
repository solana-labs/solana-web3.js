import { Encoder, mapEncoder } from '@solana/codecs-core';
import { getArrayEncoder, getBytesEncoder, getStructEncoder } from '@solana/codecs-data-structures';
import { getShortU16Encoder } from '@solana/codecs-numbers';

import { ITransactionWithSignatures } from '..';
import { getCompiledTransaction } from '../compile-transaction';
import { compileMessage } from '../message';
import { getCompiledMessageEncoder } from './message';

const transactionDescription = __DEV__ ? 'The wire format of a Solana transaction' : 'transaction';

type CompilableTransaction = Parameters<typeof compileMessage>[0];
type CompiledTransaction = ReturnType<typeof getCompiledTransaction>;

const signaturesDescription = __DEV__ ? 'A compact array of 64-byte, base-64 encoded Ed25519 signatures' : 'signatures';

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

export function getTransactionEncoder(): Encoder<
    CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)
> {
    return mapEncoder(getCompiledTransactionEncoder(), getCompiledTransaction);
}
