import { Base58EncodedAddress } from '@solana/addresses';

import { CompiledMessage, compileMessage } from '../../message';
import { getCompiledMessageEncoder } from '../message';
import { getTransactionEncoder } from '../transaction';

jest.mock('../../message');
jest.mock('../message');

let _nextMockAddress = 0;
function getMockAddress() {
    return `${_nextMockAddress++}` as Base58EncodedAddress;
}

describe('Transaction serializer', () => {
    let addressA: Base58EncodedAddress;
    let addressB: Base58EncodedAddress;
    let mockCompiledMessage: CompiledMessage;
    let mockCompiledWireMessage: Uint8Array;
    let transaction: ReturnType<typeof getTransactionEncoder>;
    beforeEach(() => {
        addressA = getMockAddress();
        addressB = getMockAddress();
        mockCompiledMessage = {
            header: {
                numReadonlyNonSignerAccounts: 0,
                numReadonlySignerAccounts: 1,
                numSignerAccounts: 2,
            },
            staticAccounts: [addressB, addressA],
        } as CompiledMessage;
        mockCompiledWireMessage = new Uint8Array([1, 2, 3]);
        (getCompiledMessageEncoder as jest.Mock).mockReturnValue({
            encode: jest.fn().mockReturnValue(mockCompiledWireMessage),
        });
        (compileMessage as jest.Mock).mockReturnValue(mockCompiledMessage);
        transaction = getTransactionEncoder();
    });
    it('serializes a transaction with no signatures', () => {
        expect(transaction.serialize({} as Parameters<typeof transaction.serialize>[0])).toStrictEqual(
            new Uint8Array([
                /** SIGNATURES */
                2, // Length of signatures array
                ...Array(64).fill(0), // null signature for `addressB`
                ...Array(64).fill(0), // null signature for `addressA`

                /** COMPILED MESSAGE */
                ...mockCompiledWireMessage,
            ])
        );
    });
    it('serializes a partially signed transaction', () => {
        const mockSignatureA = new Uint8Array(Array(64).fill(1));
        expect(
            transaction.serialize({ signatures: { [addressA]: mockSignatureA } } as Parameters<
                typeof transaction.serialize
            >[0])
        ).toStrictEqual(
            new Uint8Array([
                /** SIGNATURES */
                2, // Length of signatures array
                ...Array(64).fill(0), // null signature for `addressB`
                ...mockSignatureA,

                /** COMPILED MESSAGE */
                ...mockCompiledWireMessage,
            ])
        );
    });
    it('serializes a fully signed transaction', () => {
        const mockSignatureA = new Uint8Array(Array(64).fill(1));
        const mockSignatureB = new Uint8Array(Array(64).fill(2));
        expect(
            transaction.serialize({
                signatures: { [addressA]: mockSignatureA, [addressB]: mockSignatureB },
            } as Parameters<typeof transaction.serialize>[0])
        ).toStrictEqual(
            new Uint8Array([
                /** SIGNATURES */
                2, // Length of signatures array
                ...mockSignatureB,
                ...mockSignatureA,

                /** COMPILED MESSAGE */
                ...mockCompiledWireMessage,
            ])
        );
    });
});
