import { VariableSizeEncoder } from '@solana/codecs-core';
import { getBytesEncoder, getStructEncoder } from '@solana/codecs-data-structures';

import { NewTransaction } from '../transaction';
import { getSignaturesEncoder } from './signatures-encoder';

export function getNewTransactionEncoder(): VariableSizeEncoder<NewTransaction> {
    return getStructEncoder([
        ['signatures', getSignaturesEncoder()],
        ['messageBytes', getBytesEncoder()],
    ]);
}
