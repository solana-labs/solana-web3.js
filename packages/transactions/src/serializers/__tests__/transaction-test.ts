import { Address } from '@solana/addresses';
import { AccountRole } from '@solana/instructions';
import { AddressesByLookupTableAddress, decompileTransactionMessage } from '@solana/transaction-messages';

import { CompiledMessage, compileTransactionMessage } from '../../message';
import { getCompiledMessageDecoder, getCompiledMessageEncoder } from '../message';
import { getTransactionCodec, getTransactionDecoder, getTransactionEncoder } from '../transaction';

jest.mock('../../message');
jest.mock('../message');
jest.mock('@solana/transaction-messages', () => ({
    ...jest.requireActual('@solana/transaction-messages'),
    decompileTransactionMessage: jest.fn(),
}));

let _nextMockAddress = 0;
function getMockAddress() {
    return `${_nextMockAddress++}` as Address;
}

describe.each([getTransactionEncoder, getTransactionCodec])('Transaction serializer %p', serializerFactory => {
    let transaction: ReturnType<typeof getTransactionEncoder>;

    let addressA: Address;
    let addressB: Address;
    let mockCompiledMessage: CompiledMessage;
    let mockCompiledWireMessage: Uint8Array;
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
            getSizeFromValue: jest.fn().mockReturnValue(mockCompiledWireMessage.length),
            write: jest.fn().mockImplementation((_value, bytes: Uint8Array, offset: number) => {
                bytes.set(mockCompiledWireMessage, offset);
                return offset + mockCompiledWireMessage.length;
            }),
        });
        (getCompiledMessageDecoder as jest.Mock).mockReturnValue({
            read: jest.fn().mockReturnValue([mockCompiledMessage, 0]),
        });
        (compileTransactionMessage as jest.Mock).mockReturnValue(mockCompiledMessage);
        transaction = serializerFactory({});
    });
    it('serializes a transaction with no signatures', () => {
        expect(transaction.encode({} as Parameters<typeof transaction.encode>[0])).toStrictEqual(
            new Uint8Array([
                /** SIGNATURES */
                2, // Length of signatures array
                ...Array(64).fill(0), // null signature for `addressB`
                ...Array(64).fill(0), // null signature for `addressA`

                /** COMPILED MESSAGE */
                ...mockCompiledWireMessage,
            ]),
        );
    });
    it('serializes a partially signed transaction', () => {
        const mockSignatureA = new Uint8Array(Array(64).fill(1));
        expect(
            transaction.encode({ signatures: { [addressA]: mockSignatureA } } as Parameters<
                typeof transaction.encode
            >[0]),
        ).toStrictEqual(
            new Uint8Array([
                /** SIGNATURES */
                2, // Length of signatures array
                ...Array(64).fill(0), // null signature for `addressB`
                ...mockSignatureA,

                /** COMPILED MESSAGE */
                ...mockCompiledWireMessage,
            ]),
        );
    });
    it('serializes a fully signed transaction', () => {
        const mockSignatureA = new Uint8Array(Array(64).fill(1));
        const mockSignatureB = new Uint8Array(Array(64).fill(2));
        expect(
            transaction.encode({
                signatures: { [addressA]: mockSignatureA, [addressB]: mockSignatureB },
            } as Parameters<typeof transaction.encode>[0]),
        ).toStrictEqual(
            new Uint8Array([
                /** SIGNATURES */
                2, // Length of signatures array
                ...mockSignatureB,
                ...mockSignatureA,

                /** COMPILED MESSAGE */
                ...mockCompiledWireMessage,
            ]),
        );
    });
});

describe.each([getTransactionDecoder, getTransactionCodec])('Transaction deserializer %p', deserializerFactory => {
    let transaction: ReturnType<typeof getTransactionDecoder>;

    let addressA: Address;
    let addressB: Address;
    let mockCompiledMessage: CompiledMessage;
    let mockCompiledWireMessage: Uint8Array;
    let mockDecompiledTransactionMessage: ReturnType<typeof decompileTransactionMessage>;

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
        mockDecompiledTransactionMessage = {
            instructions: [
                {
                    accounts: [
                        {
                            address: addressA,
                            role: AccountRole.WRITABLE_SIGNER,
                        },
                        {
                            address: addressB,
                            role: AccountRole.WRITABLE_SIGNER,
                        },
                    ],
                },
            ],
        } as unknown as ReturnType<typeof decompileTransactionMessage>;

        (getCompiledMessageEncoder as jest.Mock).mockReturnValue({
            getSizeFromValue: jest.fn().mockReturnValue(mockCompiledWireMessage.length),
            write: jest.fn().mockImplementation((_value, bytes: Uint8Array, offset: number) => {
                bytes.set(mockCompiledWireMessage, offset);
                return offset + mockCompiledWireMessage.length;
            }),
        });
        (getCompiledMessageDecoder as jest.Mock).mockReturnValue({
            read: jest.fn().mockReturnValue([mockCompiledMessage, 0]),
        });
        (decompileTransactionMessage as jest.Mock).mockReturnValue(mockDecompiledTransactionMessage);

        transaction = deserializerFactory();
    });
    it('deserializes a transaction with no signatures', () => {
        const noSignature = new Uint8Array(Array(64).fill(0));
        const bytes = new Uint8Array([
            /** SIGNATURES */
            2, // Length of signatures array
            ...noSignature, // null signature for `addressB`
            ...noSignature, // null signature for `addressA`

            /** COMPILED MESSAGE */
            ...mockCompiledWireMessage,
        ]);

        const decodedTransaction = transaction.decode(bytes);
        expect(decodedTransaction).toStrictEqual(mockDecompiledTransactionMessage);
        expect(decompileTransactionMessage).toHaveBeenCalledWith(mockCompiledMessage, undefined);
    });
    it('deserializes a partially signed transaction', () => {
        const noSignature = new Uint8Array(Array(64).fill(0));
        const mockSignatureA = new Uint8Array(Array(64).fill(1));

        const bytes = new Uint8Array([
            /** SIGNATURES */
            2, // Length of signatures array
            ...noSignature, // null signature for `addressB`
            ...mockSignatureA,

            /** COMPILED MESSAGE */
            ...mockCompiledWireMessage,
        ]);

        const decodedTransaction = transaction.decode(bytes);
        const expected = {
            ...mockDecompiledTransactionMessage,
            signatures: {
                [addressA]: mockSignatureA,
            },
        };
        expect(decodedTransaction).toStrictEqual(expected);
        expect(decompileTransactionMessage).toHaveBeenCalledWith(mockCompiledMessage, undefined);
    });
    it('deserializes a fully signed transaction', () => {
        const mockSignatureA = new Uint8Array(Array(64).fill(1));
        const mockSignatureB = new Uint8Array(Array(64).fill(2));

        const bytes = new Uint8Array([
            /** SIGNATURES */
            2, // Length of signatures array
            ...mockSignatureB,
            ...mockSignatureA,

            /** COMPILED MESSAGE */
            ...mockCompiledWireMessage,
        ]);

        const decodedTransaction = transaction.decode(bytes);
        const expected = {
            ...mockDecompiledTransactionMessage,
            signatures: {
                [addressA]: mockSignatureA,
                [addressB]: mockSignatureB,
            },
        };
        expect(decodedTransaction).toStrictEqual(expected);
        expect(decompileTransactionMessage).toHaveBeenCalledWith(mockCompiledMessage, undefined);
    });
    it('passes lastValidBlockHeight to decompileTransactionMessage', () => {
        const noSignature = new Uint8Array(Array(64).fill(0));
        const bytes = new Uint8Array([
            /** SIGNATURES */
            2, // Length of signatures array
            ...noSignature, // null signature for `addressB`
            ...noSignature, // null signature for `addressA`

            /** COMPILED MESSAGE */
            ...mockCompiledWireMessage,
        ]);

        const transaction = deserializerFactory({ lastValidBlockHeight: 100n });
        const decodedTransaction = transaction.decode(bytes);
        expect(decodedTransaction).toStrictEqual(mockDecompiledTransactionMessage);
        expect(decompileTransactionMessage).toHaveBeenCalledWith(mockCompiledMessage, {
            lastValidBlockHeight: 100n,
        });
    });
    it('passes lookupTables to decompileTransactionMessage', () => {
        const noSignature = new Uint8Array(Array(64).fill(0));
        const bytes = new Uint8Array([
            /** SIGNATURES */
            2, // Length of signatures array
            ...noSignature, // null signature for `addressB`
            ...noSignature, // null signature for `addressA`

            /** COMPILED MESSAGE */
            ...mockCompiledWireMessage,
        ]);

        const lookupTables: AddressesByLookupTableAddress = {
            ['1111' as Address]: ['2222' as Address, '3333' as Address],
            ['4444' as Address]: ['5555' as Address, '6666' as Address],
        };

        const transaction = deserializerFactory({ addressesByLookupTableAddress: lookupTables });
        const decodedTransaction = transaction.decode(bytes);
        expect(decodedTransaction).toStrictEqual(mockDecompiledTransactionMessage);
        expect(decompileTransactionMessage).toHaveBeenCalledWith(mockCompiledMessage, {
            addressesByLookupTableAddress: lookupTables,
        });
    });
});
