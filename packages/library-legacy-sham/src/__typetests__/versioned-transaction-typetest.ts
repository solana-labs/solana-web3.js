/* eslint-disable @typescript-eslint/ban-ts-comment */
import { VersionedMessage, VersionedTransaction as LegacyVersionedTransaction } from '@solana/web3.js-legacy';

import { VersionedTransaction } from '../versioned-transaction.js';

const versionedMessage = null as unknown as VersionedMessage;

new VersionedTransaction(versionedMessage).signatures satisfies Uint8Array[];

new VersionedTransaction(versionedMessage) satisfies LegacyVersionedTransaction;

VersionedTransaction satisfies typeof LegacyVersionedTransaction;
