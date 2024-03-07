import { Address } from '@solana/addresses';
import { Rpc } from '@solana/rpc-spec';
import type {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    Blockhash,
    LamportsUnsafeBeyond2Pow53Minus1,
    Reward,
    TokenBalance,
    TransactionError,
    TransactionStatus,
    U64UnsafeBeyond2Pow53Minus1,
} from '@solana/rpc-types';
import { TransactionVersion } from '@solana/transactions';

import { GetBlockApi } from '../getBlock';

function assertNotAProperty<T extends object, TPropName extends string>(
    _: { [Prop in keyof T]: Prop extends TPropName ? never : T[Prop] },
    _propName: TPropName,
): void {}

const rpc = null as unknown as Rpc<GetBlockApi>;

function assertBase(
    response: {
        blockHeight: bigint;
        blockTime: number;
        blockhash: string;
        parentSlot: bigint;
        previousBlockhash: string;
    } & { [key: string]: unknown },
) {
    response.blockhash satisfies string;
    response.blockHeight satisfies bigint;
    response.blockTime satisfies number;
    response.parentSlot satisfies bigint;
    response.previousBlockhash satisfies string;
}

async () => {
    // First overload
    // Rewards set to `false`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                rewards: false,
                transactionDetails: 'none',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'transactions');
            assertNotAProperty(response, 'rewards');
        }
    }

    // First overload with configs
    // Rewards set to `false`
    {
        const response = await rpc
            .getBlock(0n, {
                commitment: 'processed',
                encoding: 'base64',
                maxSupportedTransactionVersion: 0,
                rewards: false,
                transactionDetails: 'none',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'transactions');
            assertNotAProperty(response, 'rewards');
        }
    }

    // Second overload
    // Rewards defaults to `true`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                transactionDetails: 'none',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'transactions');
            response.rewards satisfies readonly Reward[];
        }
    }

    // Second overload with configs
    // Rewards defaults to `true`
    {
        const response = await rpc
            .getBlock(0n, {
                commitment: 'confirmed',
                encoding: 'base58',
                maxSupportedTransactionVersion: 0,
                transactionDetails: 'none',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'transactions');
            response.rewards satisfies readonly Reward[];
        }
    }

    // Second overload
    // Rewards set to `true`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                rewards: true,
                transactionDetails: 'none',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'transactions');
            response.rewards satisfies readonly Reward[];
        }
    }

    // Second overload with configs
    // Rewards set to `true`
    {
        const response = await rpc
            .getBlock(0n, {
                commitment: 'confirmed',
                encoding: 'base58',
                maxSupportedTransactionVersion: 0,
                rewards: true,
                transactionDetails: 'none',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'transactions');
            response.rewards satisfies readonly Reward[];
        }
    }

    // Third overload
    // Rewards set to `false`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                rewards: false,
                transactionDetails: 'signatures',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'transactions');
            assertNotAProperty(response, 'rewards');
            response.signatures satisfies readonly Base58EncodedBytes[];
        }
    }

    // Third overload with configs
    // Rewards set to `false`
    {
        const response = await rpc
            .getBlock(0n, {
                commitment: 'confirmed',
                encoding: 'json',
                maxSupportedTransactionVersion: 0,
                rewards: false,
                transactionDetails: 'signatures',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'transactions');
            assertNotAProperty(response, 'rewards');
            response.signatures satisfies readonly Base58EncodedBytes[];
        }
    }

    // Fourth overload
    // Rewards defaults to `true`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                transactionDetails: 'signatures',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'transactions');
            response.signatures satisfies readonly Base58EncodedBytes[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Fourth overload with configs
    // Rewards defaults to `true`
    {
        const response = await rpc
            .getBlock(0n, {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
                maxSupportedTransactionVersion: 0,
                transactionDetails: 'signatures',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'transactions');
            response.signatures satisfies readonly Base58EncodedBytes[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Fourth overload
    // Rewards set to `true`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                rewards: true,
                transactionDetails: 'signatures',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'transactions');
            response.signatures satisfies readonly Base58EncodedBytes[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Fourth overload with configs
    // Rewards set to `true`
    {
        const response = await rpc
            .getBlock(0n, {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
                maxSupportedTransactionVersion: 0,
                rewards: true,
                transactionDetails: 'signatures',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'transactions');
            response.signatures satisfies readonly Base58EncodedBytes[];
            response.rewards satisfies readonly Reward[];
        }
    }

    type ExpectedMetaForAccountsBase = {
        err: TransactionError | null;
        fee: LamportsUnsafeBeyond2Pow53Minus1;
        postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        postTokenBalances?: readonly TokenBalance[];
        preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        preTokenBalances?: readonly TokenBalance[];
        status: TransactionStatus;
    };

    type ExpectedTransactionForAccountsBaseLegacy = {
        meta: ExpectedMetaForAccountsBase | null;
        transaction: {
            accountKeys: readonly Readonly<{
                pubkey: string;
                signer: boolean;
                source: 'transaction';
                writable: boolean;
            }>[];
            signatures: readonly Base58EncodedBytes[];
        };
    };

    type ExpectedTransactionForAccountsBaseVersioned = {
        meta: ExpectedMetaForAccountsBase | null;
        transaction: {
            accountKeys: readonly Readonly<{
                pubkey: string;
                signer: boolean;
                source: 'lookupTable' | 'transaction';
                writable: boolean;
            }>[];
            signatures: readonly Base58EncodedBytes[];
        };
        version: TransactionVersion;
    };

    // Fifth overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                maxSupportedTransactionVersion: 0,
                rewards: false,
                transactionDetails: 'accounts',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForAccountsBaseVersioned[];
        }
    }

    // Fifth overload with configs
    // Rewards set to `false`
    // Max supported transaction version set to 0
    {
        const response = await rpc
            .getBlock(0n, {
                commitment: 'confirmed',
                encoding: 'base64',
                maxSupportedTransactionVersion: 0,
                rewards: false,
                transactionDetails: 'accounts',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForAccountsBaseVersioned[];
        }
    }

    // Sixth overload
    // Rewards set to `false`
    // Max supported transaction version defaults to `legacy`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                rewards: false,
                transactionDetails: 'accounts',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForAccountsBaseLegacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies Array<
                ExpectedTransactionForAccountsBaseLegacy & {
                    version: 'legacy';
                }
            >;
        }
    }

    // Sixth overload with configs
    // Rewards set to `false`
    // Max supported transaction version defaults to `legacy`
    {
        const response = await rpc
            .getBlock(0n, {
                commitment: 'confirmed',
                encoding: 'base64',
                rewards: false,
                transactionDetails: 'accounts',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForAccountsBaseLegacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies Array<
                ExpectedTransactionForAccountsBaseLegacy & {
                    version: 'legacy';
                }
            >;
        }
    }

    // Seventh overload
    // Rewards defaults to `true`
    // Max supported transaction version set to 0
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                maxSupportedTransactionVersion: 0,
                transactionDetails: 'accounts',
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForAccountsBaseVersioned[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Seventh overload with configs
    // Rewards defaults to `true`
    // Max supported transaction version set to 0
    {
        const response = await rpc
            .getBlock(0n, {
                commitment: 'confirmed',
                encoding: 'base64',
                maxSupportedTransactionVersion: 0,
                transactionDetails: 'accounts',
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForAccountsBaseVersioned[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Seventh overload
    // Rewards set to `true`
    // Max supported transaction version set to 0
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                maxSupportedTransactionVersion: 0,
                rewards: true,
                transactionDetails: 'accounts',
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForAccountsBaseVersioned[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Seventh overload with configs
    // Rewards set to `true`
    // Max supported transaction version set to 0
    {
        const response = await rpc
            .getBlock(0n, {
                commitment: 'confirmed',
                encoding: 'base64',
                maxSupportedTransactionVersion: 0,
                rewards: true,
                transactionDetails: 'accounts',
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForAccountsBaseVersioned[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Eighth overload
    // Rewards defaults to `true`
    // Max supported transaction version defaults to `legacy`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                transactionDetails: 'accounts',
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForAccountsBaseLegacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies readonly (ExpectedTransactionForAccountsBaseVersioned & {
                version: 'legacy';
            })[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Eighth overload
    // Rewards set to `true`
    // Max supported transaction version defaults to `legacy`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                rewards: true,
                transactionDetails: 'accounts',
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForAccountsBaseLegacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies readonly (ExpectedTransactionForAccountsBaseVersioned & {
                version: 'legacy';
            })[];
            response.rewards satisfies readonly Reward[];
        }
    }

    type ExpectedMetaForFullBase58 = {
        computeUnitsConsumed?: U64UnsafeBeyond2Pow53Minus1;
        err: TransactionError | null;
        fee: LamportsUnsafeBeyond2Pow53Minus1;
        innerInstructions: readonly Readonly<{
            index: number;
            instructions: readonly Readonly<{
                accounts: readonly number[];
                data: Base58EncodedBytes;
                programIdIndex: number;
            }>[];
        }>[];
        logMessages: readonly string[] | null;
        postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        postTokenBalances?: readonly TokenBalance[];
        preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        preTokenBalances?: readonly TokenBalance[];
        returnData?: Readonly<{
            data: Base64EncodedDataResponse;
            programId: Address;
        }>;
        rewards: readonly Reward[] | null;
        status: TransactionStatus;
    };

    type ExpectedTransactionForFullBase58Legacy = {
        meta: ExpectedMetaForFullBase58 | null;
        transaction: Base58EncodedDataResponse;
    };

    type ExpectedTransactionForFullBase58Versioned = {
        meta:
            | (ExpectedMetaForFullBase58 &
                  Readonly<{
                      loadedAddresses: {
                          readonly: readonly Address[];
                          writable: readonly Address[];
                      };
                  }>)
            | null;
        transaction: Base58EncodedDataResponse;
        version: TransactionVersion;
    };

    // Ninth overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    // Encoding set to `base58`
    // Transaction details default to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'base58',
                maxSupportedTransactionVersion: 0,
                rewards: false,
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForFullBase58Versioned[];
        }
    }

    // Ninth overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    // Encoding set to `base58`
    // Transaction details set to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'base58',
                maxSupportedTransactionVersion: 0,
                rewards: false,
                transactionDetails: 'full',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForFullBase58Versioned[];
        }
    }

    // Tenth overload
    // Rewards set to `false`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `base58`
    // Transaction details defaults to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'base58',
                rewards: false,
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForFullBase58Legacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies readonly (ExpectedTransactionForFullBase58Legacy & {
                version: 'legacy';
            })[];
        }
    }

    // Tenth overload
    // Rewards set to `false`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `base58`
    // Transaction details set to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'base58',
                rewards: false,
                transactionDetails: 'full',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForFullBase58Legacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies readonly (ExpectedTransactionForFullBase58Legacy & {
                version: 'legacy';
            })[];
        }
    }

    // Eleventh overload
    // Rewards defaults to `true`
    // Max supported transaction version set to 0
    // Encoding set to `base58`
    // Transaction details defaults to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'base58',
                maxSupportedTransactionVersion: 0,
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForFullBase58Versioned[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Eleventh overload
    // Rewards set to `true`
    // Max supported transaction version set to 0
    // Encoding set to `base58`
    // Transaction details defaults to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'base58',
                maxSupportedTransactionVersion: 0,
                rewards: true,
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForFullBase58Versioned[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Twelfth overload
    // Rewards defaults to `true`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `base58`
    // Transaction details defaults to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'base58',
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForFullBase58Legacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies readonly (ExpectedTransactionForFullBase58Legacy & {
                version: 'legacy';
            })[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Twelfth overload
    // Rewards set to `true`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `base58`
    // Transaction details defaults to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'base58',
                rewards: true,
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForFullBase58Legacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies readonly (ExpectedTransactionForFullBase58Legacy & {
                version: 'legacy';
            })[];
            response.rewards satisfies readonly Reward[];
        }
    }

    type ExpectedMetaForFullBase64 = {
        computeUnitsConsumed?: U64UnsafeBeyond2Pow53Minus1;
        err: TransactionError | null;
        fee: LamportsUnsafeBeyond2Pow53Minus1;
        innerInstructions: readonly Readonly<{
            index: number;
            instructions: readonly Readonly<{
                accounts: readonly number[];
                data: Base58EncodedBytes;
                programIdIndex: number;
            }>[];
        }>[];
        logMessages: readonly string[] | null;
        postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        postTokenBalances?: readonly TokenBalance[];
        preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        preTokenBalances?: readonly TokenBalance[];
        returnData?: Readonly<{
            data: Base64EncodedDataResponse;
            programId: Address;
        }>;
        rewards: readonly Reward[] | null;
        status: TransactionStatus;
    };

    type ExpectedTransactionForFullBase64Legacy = {
        meta: ExpectedMetaForFullBase64 | null;
        transaction: Base64EncodedDataResponse;
    };

    type ExpectedTransactionForFullBase64Versioned = {
        meta:
            | (ExpectedMetaForFullBase64 &
                  Readonly<{
                      loadedAddresses: {
                          readonly: readonly Address[];
                          writable: readonly Address[];
                      };
                  }>)
            | null;
        transaction: Base64EncodedDataResponse;
        version: TransactionVersion;
    };

    // Thirteenth overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    // Encoding set to `base64`
    // Transaction details default to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'base64',
                maxSupportedTransactionVersion: 0,
                rewards: false,
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForFullBase64Versioned[];
        }
    }

    // Thirteenth overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    // Encoding set to `base64`
    // Transaction details set to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'base64',
                maxSupportedTransactionVersion: 0,
                rewards: false,
                transactionDetails: 'full',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForFullBase64Versioned[];
        }
    }

    // Fourteenth overload
    // Rewards set to `false`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `base64`
    // Transaction details defaults to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'base64',
                rewards: false,
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForFullBase64Legacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies readonly (ExpectedTransactionForFullBase64Legacy & {
                version: 'legacy';
            })[];
        }
    }

    // Fourteenth overload
    // Rewards set to `false`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `base64`
    // Transaction details set to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'base64',
                rewards: false,
                transactionDetails: 'full',
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForFullBase64Legacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies readonly (ExpectedTransactionForFullBase64Legacy & {
                version: 'legacy';
            })[];
        }
    }

    // Fifteenth overload
    // Rewards defaults to `true`
    // Max supported transaction version set to 0
    // Encoding set to `base64`
    // Transaction details defaults to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'base64',
                maxSupportedTransactionVersion: 0,
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForFullBase64Versioned[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Sixteenth overload
    // Rewards defaults to `true`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `base64`
    // Transaction details defaults to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'base64',
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForFullBase64Legacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies readonly (ExpectedTransactionForFullBase64Legacy & {
                version: 'legacy';
            })[];
            response.rewards satisfies readonly Reward[];
        }
    }

    type ExpectedParsedTransactionInstruction = Readonly<{
        parsed: {
            info?: object;
            type: string;
        };
        program: string;
        programId: Address;
    }>;

    type ExpectedPartiallyDecodedTransactionInstruction = Readonly<{
        accounts: readonly Address[];
        data: Base58EncodedBytes;
        programId: Address;
    }>;

    type ExpectedTransactionInstructionForFullJsonParsed =
        | ExpectedParsedTransactionInstruction
        | ExpectedPartiallyDecodedTransactionInstruction;

    type ExpectedMetaForFullJsonParsedBase = {
        computeUnitsConsumed?: U64UnsafeBeyond2Pow53Minus1;
        err: TransactionError | null;
        fee: LamportsUnsafeBeyond2Pow53Minus1;
        innerInstructions: readonly Readonly<{
            index: number;
            instructions: readonly ExpectedTransactionInstructionForFullJsonParsed[];
        }>[];
        logMessages: readonly string[] | null;
        postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        postTokenBalances?: readonly TokenBalance[];
        preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        preTokenBalances?: readonly TokenBalance[];
        returnData?: Readonly<{
            data: Base64EncodedDataResponse;
            programId: Address;
        }>;
        rewards: readonly Reward[] | null;
        status: TransactionStatus;
    };

    type ExpectedMetaForFullJsonParsedLoadedAddresses = Readonly<{
        loadedAddresses: {
            readonly: readonly Address[];
            writable: readonly Address[];
        };
    }>;

    type ExpectedTransactionForFullJsonParsedBase = {
        message: {
            header: {
                numReadonlySignedAccounts: number;
                numReadonlyUnsignedAccounts: number;
                numRequiredSignatures: number;
            };
            instructions: readonly ExpectedTransactionInstructionForFullJsonParsed[];
            recentBlockhash: Blockhash;
        };
        signatures: readonly Base58EncodedBytes[];
    };

    type ExpectedTransactionForFullJsonParsedLegacy = {
        meta: ExpectedMetaForFullJsonParsedBase | null;
        transaction: ExpectedTransactionForFullJsonParsedBase & {
            message: Readonly<{
                accountKeys: readonly Readonly<{
                    pubkey: string;
                    signer: boolean;
                    source: 'transaction';
                    writable: boolean;
                }>[];
            }>;
        };
    };

    type ExpectedTransactionForFullJsonParsedVersioned = {
        meta: (ExpectedMetaForFullJsonParsedBase & ExpectedMetaForFullJsonParsedLoadedAddresses) | null;
        transaction: ExpectedTransactionForFullJsonParsedBase & {
            message: Readonly<{
                accountKeys: readonly Readonly<{
                    pubkey: string;
                    signer: boolean;
                    source: 'lookupTable' | 'transaction';
                    writable: boolean;
                }>[];
            }>;
        };
        version: TransactionVersion;
    };

    // Seventeenth overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    // Encoding set to `jsonParsed`
    // Transaction details default to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'jsonParsed',
                maxSupportedTransactionVersion: 0,
                rewards: false,
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForFullJsonParsedVersioned[];
        }
    }

    // Eighteenth overload
    // Rewards set to `false`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `jsonParsed`
    // Transaction details defaults to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'jsonParsed',
                rewards: false,
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForFullJsonParsedLegacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies readonly (ExpectedTransactionForFullJsonParsedLegacy & {
                version: 'legacy';
            })[];
        }
    }

    // Nineteenth overload
    // Rewards defaults to `true`
    // Max supported transaction version set to 0
    // Encoding set to `jsonParsed`
    // Transaction details defaults to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'jsonParsed',
                maxSupportedTransactionVersion: 0,
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions[0].transaction;
            response.transactions satisfies readonly ExpectedTransactionForFullJsonParsedVersioned[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Twentieth overload
    // Rewards defaults to `true`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `jsonParsed`
    // Transaction details defaults to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'jsonParsed',
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForFullJsonParsedLegacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies readonly (ExpectedTransactionForFullJsonParsedLegacy & {
                version: 'legacy';
            })[];
            response.rewards satisfies readonly Reward[];
        }
    }

    type ExpectedTransactionInstructionForFullJson = {
        accounts: readonly number[];
        data: Base58EncodedBytes;
        programIdIndex: number;
    };

    type ExpectedMetaForFullJsonBase = {
        computeUnitsConsumed?: U64UnsafeBeyond2Pow53Minus1;
        err: TransactionError | null;
        fee: LamportsUnsafeBeyond2Pow53Minus1;
        innerInstructions: readonly Readonly<{
            index: number;
            instructions: readonly ExpectedTransactionInstructionForFullJson[];
        }>[];
        logMessages: readonly string[] | null;
        postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        postTokenBalances?: readonly TokenBalance[];
        preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        preTokenBalances?: readonly TokenBalance[];
        returnData?: Readonly<{
            data: Base64EncodedDataResponse;
            programId: Address;
        }>;
        rewards: readonly Reward[] | null;
        status: TransactionStatus;
    };

    type ExpectedMetaForFullJsonLoadedAddresses = Readonly<{
        loadedAddresses: {
            readonly: readonly Address[];
            writable: readonly Address[];
        };
    }>;

    type ExpectedTransactionForFullJsonBase = {
        message: {
            accountKeys: readonly Address[];
            header: {
                numReadonlySignedAccounts: number;
                numReadonlyUnsignedAccounts: number;
                numRequiredSignatures: number;
            };
            instructions: readonly ExpectedTransactionInstructionForFullJson[];
            recentBlockhash: Blockhash;
        };
        signatures: readonly Base58EncodedBytes[];
    };

    type ExpectedTransactionForFullJsonLegacy = {
        meta: ExpectedMetaForFullJsonBase | null;
        transaction: ExpectedTransactionForFullJsonBase;
    };

    type ExpectedTransactionForFullJsonVersioned = {
        meta: (ExpectedMetaForFullJsonBase & ExpectedMetaForFullJsonLoadedAddresses) | null;
        transaction: ExpectedTransactionForFullJsonBase;
        version: TransactionVersion;
    };

    // Twenty-first overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    // Encoding defaults to `json`
    // Transaction details default to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                maxSupportedTransactionVersion: 0,
                rewards: false,
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForFullJsonVersioned[];
        }
    }

    // Twenty-first overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    // Encoding set to `json`
    // Transaction details defaults to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                encoding: 'json',
                maxSupportedTransactionVersion: 0,
                rewards: false,
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForFullJsonVersioned[];
        }
    }

    // Twenty-second overload
    // Rewards set to `false`
    // Max supported transaction defaults to `legacy`
    // Encoding defaults to `json`
    // Transaction details defaults to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                rewards: false,
            })
            .send();
        if (response) {
            assertBase(response);
            assertNotAProperty(response, 'rewards');
            response.transactions satisfies readonly ExpectedTransactionForFullJsonLegacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies readonly (ExpectedTransactionForFullJsonLegacy & {
                version: 'legacy';
            })[];
        }
    }

    // Twenty-third overload
    // Rewards defaults to `true`
    // Max supported transaction version set to 0
    // Encoding defaults to `json`
    // Transaction details defaults to `full`
    {
        const response = await rpc
            .getBlock(0n, {
                // No extra configs
                maxSupportedTransactionVersion: 0,
            })
            .send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForFullJsonVersioned[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Twenty-fourth overload
    // Rewards defaults to `true`
    // Max supported transaction defaults to `legacy`
    // Encoding defaults to `json`
    // Transaction details defaults to `full`
    {
        const response = await rpc.getBlock(0n).send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForFullJsonLegacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies readonly (ExpectedTransactionForFullJsonLegacy & {
                version: 'legacy';
            })[];
            response.rewards satisfies readonly Reward[];
        }
    }

    // Twenty-fourth overload with configs
    {
        const response = await rpc.getBlock(0n, { commitment: 'confirmed' }).send();
        if (response) {
            assertBase(response);
            response.transactions satisfies readonly ExpectedTransactionForFullJsonLegacy[];
            // @ts-expect-error `version` should be undefined
            response.transactions satisfies readonly (ExpectedTransactionForFullJsonLegacy & {
                version: 'legacy';
            })[];
            response.rewards satisfies readonly Reward[];
        }
    }
};
