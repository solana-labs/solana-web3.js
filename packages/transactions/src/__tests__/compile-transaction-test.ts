import { Address } from '@solana/addresses';

import { getCompiledTransaction } from '../compile-transaction';
import { CompiledMessage, compileTransactionMessage } from '../message';
import { ITransactionWithSignatures } from '../signatures';

jest.mock('../message');

let _nextMockAddress = 0;
function getMockAddress() {
    return `${_nextMockAddress++}` as Address;
}

describe('getCompiledTransaction', () => {
    let addressA: Address;
    let addressB: Address;
    let mockCompiledMessage: CompiledMessage;
    beforeEach(() => {
        addressA = getMockAddress();
        addressB = getMockAddress();
        mockCompiledMessage = {
            header: {
                numReadonlyNonSignerAccounts: 0,
                numReadonlySignerAccounts: 0,
                numSignerAccounts: 2,
            },
            staticAccounts: [addressB, addressA],
        } as CompiledMessage;
        (compileTransactionMessage as jest.Mock).mockReturnValue(mockCompiledMessage);
    });
    it('compiles the transaction message', () => {
        const compiledTransaction = getCompiledTransaction({} as Parameters<typeof getCompiledTransaction>[0]);
        expect(compiledTransaction).toHaveProperty('compiledMessage', mockCompiledMessage);
    });
    it('compiles an array of signatures the length of the number of signers', () => {
        const compiledTransaction = getCompiledTransaction({} as Parameters<typeof getCompiledTransaction>[0]);
        expect(compiledTransaction.signatures).toHaveLength(mockCompiledMessage.header.numSignerAccounts);
    });
    it("compiles signatures into the correct position in the signatures' array", () => {
        const mockSignatureA = new Uint8Array(64).fill(1);
        const mockSignatureB = new Uint8Array(64).fill(2);
        const transactionWithSignatures = {
            signatures: { [addressA]: mockSignatureA, [addressB]: mockSignatureB },
        } as ITransactionWithSignatures & Parameters<typeof getCompiledTransaction>[0];
        const compiledTransaction = getCompiledTransaction(transactionWithSignatures);
        expect(compiledTransaction).toHaveProperty('signatures', [
            // Two signers, in the order they're found in `mockCompiledMessage.staticAccounts`
            mockSignatureB,
            mockSignatureA,
        ]);
    });
    it('compiles a null signature into the compiled signatures array when a signature is missing', () => {
        const mockSignatureA = new Uint8Array(64).fill(1);
        const transactionWithSignatures = {
            signatures: { [addressA]: mockSignatureA },
        } as ITransactionWithSignatures & Parameters<typeof getCompiledTransaction>[0];
        const compiledTransaction = getCompiledTransaction(transactionWithSignatures);
        expect(compiledTransaction).toHaveProperty('signatures', [
            new Uint8Array(Array(64).fill(0)), // Missing signature for account B
            mockSignatureA,
        ]);
    });
});
