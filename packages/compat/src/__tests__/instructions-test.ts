import { AccountRole } from '@solana/instructions';
import { Keypair, PublicKey } from '@solana/web3.js';
import { fromLegacyTransactionInstruction } from '../instructions';

describe('fromLegacyTransactionInstruction', () => {
  let account1: PublicKey;
  let account2: PublicKey;
  let programId: PublicKey;

  beforeEach(() => {
    account1 = Keypair.generate().publicKey;
    account2 = Keypair.generate().publicKey;
    programId = Keypair.generate().publicKey;
  });

  it('converts standard instruction with mixed account roles', () => {
    const testCases = [
      {
        description: 'Instruction with writable signer and writable accounts',
        data: Buffer.from([1, 2, 3]),
        keys: [
          { isSigner: true, isWritable: true, pubkey: account1 },
          { isSigner: false, isWritable: true, pubkey: account2 },
        ],
        expectedAccounts: [
          { 
            address: account1.toBase58(), 
            role: AccountRole.WRITABLE_SIGNER 
          },
          { 
            address: account2.toBase58(), 
            role: AccountRole.WRITABLE 
          }
        ]
      },
      {
        description: 'Instruction with readonly signer and readonly accounts',
        data: Buffer.from([4, 5, 6]),
        keys: [
          { isSigner: true, isWritable: false, pubkey: account1 },
          { isSigner: false, isWritable: false, pubkey: account2 },
        ],
        expectedAccounts: [
          { 
            address: account1.toBase58(), 
            role: AccountRole.READONLY_SIGNER 
          },
          { 
            address: account2.toBase58(), 
            role: AccountRole.READONLY 
          }
        ]
      }
    ];

    testCases.forEach(({ description, data, keys, expectedAccounts }) => {
      const legacyInstruction = { 
        data, 
        keys, 
        programId 
      };

      const converted = fromLegacyTransactionInstruction(legacyInstruction);

      describe(description, () => {
        it('converts data correctly', () => {
          expect(converted.data).toStrictEqual(new Uint8Array(data));
        });

        it('converts program address correctly', () => {
          expect(converted.programAddress).toBe(programId.toBase58());
        });

        it('converts accounts correctly', () => {
          expect(converted.accounts).toHaveLength(expectedAccounts.length);
          expectedAccounts.forEach((expectedAccount, index) => {
            expect(converted.accounts![index]).toEqual(expectedAccount);
          });
        });
      });
    });
  });

  it('handles empty data instruction', () => {
    const legacyInstruction = { 
      data: Buffer.alloc(0), 
      keys: [{ isSigner: false, isWritable: false, pubkey: account1 }], 
      programId 
    };

    const converted = fromLegacyTransactionInstruction(legacyInstruction);

    expect(converted.data).toStrictEqual(new Uint8Array());
    expect(converted.accounts).toHaveLength(1);
    expect(converted.accounts![0].role).toBe(AccountRole.READONLY);
  });
});