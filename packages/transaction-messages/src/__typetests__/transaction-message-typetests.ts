import { createTransactionMessage } from '../create-transaction-message';
import { TransactionMessage } from '../transaction-message';

// createTransactionMessage
createTransactionMessage({ version: 'legacy' }) satisfies Extract<TransactionMessage, { version: 'legacy' }>;
// @ts-expect-error version should match
createTransactionMessage({ version: 0 }) satisfies Extract<TransactionMessage, { version: 'legacy' }>;
createTransactionMessage({ version: 0 }) satisfies Extract<TransactionMessage, { version: 0 }>;
// @ts-expect-error version should match
createTransactionMessage({ version: 'legacy' }) satisfies Extract<TransactionMessage, { version: 0 }>;
