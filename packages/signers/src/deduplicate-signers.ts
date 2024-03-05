import { Address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__ADDRESS_CANNOT_HAVE_MULTIPLE_SIGNERS, SolanaError } from '@solana/errors';

import { MessageSigner } from './message-signer';
import { TransactionSigner } from './transaction-signer';

/** Removes all duplicated signers from a provided array by comparing their addresses. */
export function deduplicateSigners<TSigner extends MessageSigner | TransactionSigner>(
    signers: readonly TSigner[],
): readonly TSigner[] {
    const deduplicated: Record<Address, TSigner> = {};
    signers.forEach(signer => {
        if (!deduplicated[signer.address]) {
            deduplicated[signer.address] = signer;
        } else if (deduplicated[signer.address] !== signer) {
            throw new SolanaError(SOLANA_ERROR__SIGNER__ADDRESS_CANNOT_HAVE_MULTIPLE_SIGNERS, {
                address: signer.address,
            });
        }
    });
    return Object.values(deduplicated);
}
