import { Address } from '@solana/addresses';
import { AccountRole } from '@solana/instructions';
import { SignatureBytes } from '@solana/keys';
import type { Blockhash } from '@solana/rpc-types';

import { getBase64EncodedWireTransaction } from '../wire-transaction';

describe('getBase64EncodedWireTransaction', () => {
    it('serializes a transaction to wire format', () => {
        const tx: Parameters<typeof getBase64EncodedWireTransaction>[0] = {
            feePayer: '22222222222222222222222222222222222222222222' as Address,
            instructions: [
                {
                    accounts: [
                        {
                            address: '44444444444444444444444444444444444444444444' as Address,
                            role: AccountRole.READONLY_SIGNER,
                        },
                    ],
                    programAddress: '55555555555555555555555555555555555555555555' as Address,
                },
            ],
            lifetimeConstraint: {
                blockhash: '33333333333333333333333333333333333333333333' as Blockhash,
                lastValidBlockHeight: 123n,
            },
            signatures: {
                /* No signature for fee payer */
                ['44444444444444444444444444444444444444444444' as Address]:
                    // Base58 encoded signature: `3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333`
                    new Uint8Array([
                        0x65, 0xc9, 0xfa, 0x89, 0xe6, 0xab, 0xdb, 0x8b, 0x62, 0x79, 0xaf, 0x58, 0x43, 0x82, 0x48, 0xa6,
                        0x7f, 0xbc, 0x40, 0xb2, 0x37, 0x06, 0x76, 0xe0, 0xed, 0xa6, 0xef, 0x73, 0x7d, 0x39, 0xfc, 0x30,
                        0x6c, 0x80, 0x80, 0xc0, 0x66, 0x2d, 0x32, 0x7a, 0x56, 0xb5, 0xb9, 0xd3, 0xc1, 0x20, 0xd7, 0x15,
                        0xa4, 0x34, 0x3f, 0x93, 0x8a, 0x23, 0xee, 0x08, 0xfb, 0x82, 0x3e, 0xe0, 0x8f, 0xb8, 0x23, 0xee,
                    ]) as SignatureBytes,
            },
            version: 0,
        };
        expect(getBase64EncodedWireTransaction(tx))
            // Copy and paste this string into the Solana Explorer at https://explorer.solana.com/tx/inspector
            .toBe(
                'AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABlyfqJ5qvbi2J5r1hDgkimf7xAsjcGduDtpu9zfTn8MGyAgMBmLTJ6VrW508Eg1xWkND+TiiPuCPuCPuCPuCPugAIBAQMPHmsUIcBKBwQxJlwZxbvuGZK66K/RzQeO+K9wR9wR9y1bQTxlQN4VDJNzFE1RM8pMuDC6D3VnFqzqDlDXlDXlPHmsUIcBKBwQxJlwZxbvuGZK66K/RzQeO+K9wR9wR9wePNYoQ4CUDghiTLgzi3fcMyV10V+jmg8d8V7gj7gj7gECAQEAAA==',
            );
    });
});
