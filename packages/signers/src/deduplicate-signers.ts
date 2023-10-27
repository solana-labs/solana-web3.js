import { Address } from '@solana/addresses';

import { MessageSigner } from './message-signer';
import { TransactionSigner } from './transaction-signer';

/** Removes all duplicated signers from a provided array by comparing their addresses. */
export function deduplicateSigners<TSigner extends MessageSigner | TransactionSigner>(
    signers: readonly TSigner[]
): readonly TSigner[] {
    const deduplicated: Record<Address, TSigner> = {};
    signers.forEach(signer => {
        if (!deduplicated[signer.address]) {
            deduplicated[signer.address] = signer;
        }
    });
    return Object.values(deduplicated);
}
