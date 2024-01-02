import { Address } from '@solana/addresses';
import { AccountRole } from '@solana/instructions';
import type { GetMultipleAccountsApi } from '@solana/rpc-core';
import type { Rpc } from '@solana/rpc-transport';

import { decompileTransaction } from '../../decompile-transaction';
import { CompiledMessage, compileMessage } from '../../message';
import { getCompiledMessageDecoder, getCompiledMessageEncoder } from '../message';
import { getTransactionDecoder, getTransactionEncoder } from '../transaction';

jest.mock('../../message');
jest.mock('../message');
jest.mock('../../decompile-transaction');

let _nextMockAddress = 0;
function getMockAddress() {
    return `${_nextMockAddress++}` as Address;
}

describe.each([getTransactionEncoder])('Transaction serializer %p', serializerFactory => {
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
        (compileMessage as jest.Mock).mockReturnValue(mockCompiledMessage);
        transaction = serializerFactory();
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

describe.each([getTransactionDecoder])('Transaction deserializer %p', deserializerFactory => {
    let transaction: ReturnType<typeof getTransactionDecoder>;

    let addressA: Address;
    let addressB: Address;
    let mockCompiledMessage: CompiledMessage;
    let mockCompiledWireMessage: Uint8Array;
    let mockDecompiledTransaction: ReturnType<typeof decompileTransaction>;

    const nullRpc = {} as unknown as Rpc<GetMultipleAccountsApi>;

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
        mockDecompiledTransaction = {
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
        } as unknown as ReturnType<typeof decompileTransaction>;

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
        (decompileTransaction as jest.Mock).mockResolvedValue(mockDecompiledTransaction);

        transaction = deserializerFactory(nullRpc);
    });
    it('deserializes a transaction with no signatures', async () => {
        expect.assertions(2);

        const noSignature = new Uint8Array(Array(64).fill(0));
        const bytes = new Uint8Array([
            /** SIGNATURES */
            2, // Length of signatures array
            ...noSignature, // null signature for `addressB`
            ...noSignature, // null signature for `addressA`

            /** COMPILED MESSAGE */
            ...mockCompiledWireMessage,
        ]);

        const decodedTransaction = await transaction.decode(bytes);
        expect(decodedTransaction).toStrictEqual(mockDecompiledTransaction);
        expect(decompileTransaction).toHaveBeenCalledWith(
            {
                compiledMessage: mockCompiledMessage,
                signatures: [noSignature, noSignature],
            },
            nullRpc,
            undefined,
        );
    });
    it('deserializes a partially signed transaction', async () => {
        expect.assertions(2);

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

        const decodedTransaction = await transaction.decode(bytes);
        expect(decodedTransaction).toStrictEqual(mockDecompiledTransaction);
        expect(decompileTransaction).toHaveBeenCalledWith(
            {
                compiledMessage: mockCompiledMessage,
                signatures: [noSignature, mockSignatureA],
            },
            nullRpc,
            undefined,
        );
    });
    it('deserializes a fully signed transaction', async () => {
        expect.assertions(2);

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

        const decodedTransaction = await transaction.decode(bytes);
        expect(decodedTransaction).toStrictEqual(mockDecompiledTransaction);
        expect(decompileTransaction).toHaveBeenCalledWith(
            {
                compiledMessage: mockCompiledMessage,
                signatures: [mockSignatureB, mockSignatureA],
            },
            nullRpc,
            undefined,
        );
    });
    it('passes lastValidBlockHeight to decompileTransaction', async () => {
        expect.assertions(2);

        const noSignature = new Uint8Array(Array(64).fill(0));
        const bytes = new Uint8Array([
            /** SIGNATURES */
            2, // Length of signatures array
            ...noSignature, // null signature for `addressB`
            ...noSignature, // null signature for `addressA`

            /** COMPILED MESSAGE */
            ...mockCompiledWireMessage,
        ]);

        const transaction = deserializerFactory(nullRpc, 100n);
        const decodedTransaction = await transaction.decode(bytes);
        expect(decodedTransaction).toStrictEqual(mockDecompiledTransaction);
        expect(decompileTransaction).toHaveBeenCalledWith(
            {
                compiledMessage: mockCompiledMessage,
                signatures: [noSignature, noSignature],
            },
            nullRpc,
            100n,
        );
    });
});
