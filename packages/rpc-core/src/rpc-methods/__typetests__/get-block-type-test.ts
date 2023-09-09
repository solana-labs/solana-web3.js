import { Base58EncodedAddress } from '@solana/addresses';
import { Blockhash, TransactionVersion } from '@solana/transactions';
import assert from 'assert';

import { TransactionError } from '../../transaction-error';
import {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    LamportsUnsafeBeyond2Pow53Minus1,
    Reward,
    TokenBalance,
    TransactionStatus,
    U64UnsafeBeyond2Pow53Minus1,
} from '../common';
import { mockTypeTestResponse, mockTypeTestRpc } from './common';

const rpc = mockTypeTestRpc();

function assertBase(
    response: {
        blockhash: string;
        blockHeight: bigint;
        blockTime: number;
        parentSlot: bigint;
        previousBlockhash: string;
    } & { [key: string]: unknown }
) {
    response.blockhash satisfies string;
    response.blockHeight satisfies bigint;
    response.blockTime satisfies number;
    response.parentSlot satisfies bigint;
    response.previousBlockhash satisfies string;
}

// First overload
// Rewards set to `false`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            rewards: false,
            transactionDetails: 'none',
        })
    );
    assert(response);
    assertBase(response);
    // @ts-expect-error Should be undefined
    response.transactions satisfies Array<unknown>;
    // @ts-expect-error Should be undefined
    response.rewards satisfies readonly Reward[];
}

// First overload with configs
// Rewards set to `false`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            commitment: 'processed',
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
            rewards: false,
            transactionDetails: 'none',
        })
    );
    assert(response);
    assertBase(response);
    // @ts-expect-error Should be undefined
    response.transactions satisfies Array<unknown>;
    // @ts-expect-error Should be undefined
    response.rewards satisfies readonly Reward[];
}

// Second overload
// Rewards defaults to `true`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            transactionDetails: 'none',
        })
    );
    assert(response);
    assertBase(response);
    // @ts-expect-error Should be undefined
    response.transactions satisfies Array<unknown>;
    response.rewards satisfies readonly Reward[];
}

// Second overload with configs
// Rewards defaults to `true`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            commitment: 'confirmed',
            encoding: 'base58',
            maxSupportedTransactionVersion: 0,
            transactionDetails: 'none',
        })
    );
    assert(response);
    assertBase(response);
    // @ts-expect-error Should be undefined
    response.transactions satisfies Array<unknown>;
    response.rewards satisfies readonly Reward[];
}

// Second overload
// Rewards set to `true`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            rewards: true,
            transactionDetails: 'none',
        })
    );
    assert(response);
    assertBase(response);
    // @ts-expect-error Should be undefined
    response.transactions satisfies Array<unknown>;
    response.rewards satisfies readonly Reward[];
}

// Second overload with configs
// Rewards set to `true`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            commitment: 'confirmed',
            encoding: 'base58',
            maxSupportedTransactionVersion: 0,
            rewards: true,
            transactionDetails: 'none',
        })
    );
    assert(response);
    assertBase(response);
    // @ts-expect-error Should be undefined
    response.transactions satisfies Array<unknown>;
    response.rewards satisfies readonly Reward[];
}

// Third overload
// Rewards set to `false`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            rewards: false,
            transactionDetails: 'signatures',
        })
    );
    assert(response);
    assertBase(response);
    // @ts-expect-error Should be undefined
    response.transactions satisfies Array<unknown>;
    response.signatures satisfies readonly Base58EncodedBytes[];
    // @ts-expect-error Should be undefined
    response.rewards satisfies readonly Reward[];
}

// Third overload with configs
// Rewards set to `false`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            commitment: 'confirmed',
            encoding: 'json',
            maxSupportedTransactionVersion: 0,
            rewards: false,
            transactionDetails: 'signatures',
        })
    );
    assert(response);
    assertBase(response);
    // @ts-expect-error Should be undefined
    response.transactions satisfies Array<unknown>;
    response.signatures satisfies readonly Base58EncodedBytes[];
    // @ts-expect-error Should be undefined
    response.rewards satisfies readonly Reward[];
}

// Fourth overload
// Rewards defaults to `true`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            transactionDetails: 'signatures',
        })
    );
    assert(response);
    assertBase(response);
    // @ts-expect-error Should be undefined
    response.transactions satisfies Array<unknown>;
    response.signatures satisfies readonly Base58EncodedBytes[];
    response.rewards satisfies readonly Reward[];
}

// Fourth overload with configs
// Rewards defaults to `true`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            commitment: 'confirmed',
            encoding: 'jsonParsed',
            maxSupportedTransactionVersion: 0,
            transactionDetails: 'signatures',
        })
    );
    assert(response);
    assertBase(response);
    // @ts-expect-error Should be undefined
    response.transactions satisfies Array<unknown>;
    response.signatures satisfies readonly Base58EncodedBytes[];
    response.rewards satisfies readonly Reward[];
}

// Fourth overload
// Rewards set to `true`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            rewards: true,
            transactionDetails: 'signatures',
        })
    );
    assert(response);
    assertBase(response);
    // @ts-expect-error Should be undefined
    response.transactions satisfies Array<unknown>;
    response.signatures satisfies readonly Base58EncodedBytes[];
    response.rewards satisfies readonly Reward[];
}

// Fourth overload with configs
// Rewards set to `true`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            commitment: 'confirmed',
            encoding: 'jsonParsed',
            maxSupportedTransactionVersion: 0,
            rewards: true,
            transactionDetails: 'signatures',
        })
    );
    assert(response);
    assertBase(response);
    // @ts-expect-error Should be undefined
    response.transactions satisfies Array<unknown>;
    response.signatures satisfies readonly Base58EncodedBytes[];
    response.rewards satisfies readonly Reward[];
}

type ExpectedMetaForAccountsBase = {
    err: TransactionError | null;
    fee: LamportsUnsafeBeyond2Pow53Minus1;
    preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    preTokenBalances?: readonly TokenBalance[];
    postTokenBalances?: readonly TokenBalance[];
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
            source: 'transaction' | 'lookupTable';
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
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            maxSupportedTransactionVersion: 0,
            rewards: false,
            transactionDetails: 'accounts',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForAccountsBaseVersioned[];
    // @ts-expect-error Should be undefined
    response.rewards satisfies readonly Reward[];
}

// Fifth overload with configs
// Rewards set to `false`
// Max supported transaction version set to 0
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            commitment: 'confirmed',
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
            rewards: false,
            transactionDetails: 'accounts',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForAccountsBaseVersioned[];
    // @ts-expect-error Should be undefined
    response.rewards satisfies readonly Reward[];
}

// Sixth overload
// Rewards set to `false`
// Max supported transaction version defaults to `legacy`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            rewards: false,
            transactionDetails: 'accounts',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForAccountsBaseLegacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies Array<
        ExpectedTransactionForAccountsBaseLegacy & {
            version: 'legacy';
        }
    >;
    // @ts-expect-error Should be undefined
    response.rewards satisfies readonly Reward[];
}

// Sixth overload with configs
// Rewards set to `false`
// Max supported transaction version defaults to `legacy`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            commitment: 'confirmed',
            encoding: 'base64',
            rewards: false,
            transactionDetails: 'accounts',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForAccountsBaseLegacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies Array<
        ExpectedTransactionForAccountsBaseLegacy & {
            version: 'legacy';
        }
    >;
    // @ts-expect-error Should be undefined
    response.rewards satisfies readonly Reward[];
}

// Seventh overload
// Rewards defaults to `true`
// Max supported transaction version set to 0
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            maxSupportedTransactionVersion: 0,
            transactionDetails: 'accounts',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForAccountsBaseVersioned[];
    response.rewards satisfies readonly Reward[];
}

// Seventh overload with configs
// Rewards defaults to `true`
// Max supported transaction version set to 0
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            commitment: 'confirmed',
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
            transactionDetails: 'accounts',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForAccountsBaseVersioned[];
    response.rewards satisfies readonly Reward[];
}

// Seventh overload
// Rewards set to `true`
// Max supported transaction version set to 0
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            maxSupportedTransactionVersion: 0,
            rewards: true,
            transactionDetails: 'accounts',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForAccountsBaseVersioned[];
    response.rewards satisfies readonly Reward[];
}

// Seventh overload with configs
// Rewards set to `true`
// Max supported transaction version set to 0
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            commitment: 'confirmed',
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
            rewards: true,
            transactionDetails: 'accounts',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForAccountsBaseVersioned[];
    response.rewards satisfies readonly Reward[];
}

// Eighth overload
// Rewards defaults to `true`
// Max supported transaction version defaults to `legacy`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            transactionDetails: 'accounts',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForAccountsBaseLegacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForAccountsBaseVersioned & {
        version: 'legacy';
    })[];
    response.rewards satisfies readonly Reward[];
}

// Eighth overload
// Rewards set to `true`
// Max supported transaction version defaults to `legacy`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            rewards: true,
            transactionDetails: 'accounts',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForAccountsBaseLegacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForAccountsBaseVersioned & {
        version: 'legacy';
    })[];
    response.rewards satisfies readonly Reward[];
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
    preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    preTokenBalances?: readonly TokenBalance[];
    postTokenBalances?: readonly TokenBalance[];
    rewards: readonly Reward[] | null;
    returnData?: Readonly<{
        programId: Base58EncodedAddress;
        data: Base64EncodedDataResponse;
    }>;
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
                      writable: readonly Base58EncodedAddress[];
                      readonly: readonly Base58EncodedAddress[];
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
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'base58',
            maxSupportedTransactionVersion: 0,
            rewards: false,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullBase58Versioned[];
    // @ts-expect-error `rewards` should be undefined
    response.rewards satisfies readonly Reward[];
}

// Ninth overload
// Rewards set to `false`
// Max supported transaction version set to 0
// Encoding set to `base58`
// Transaction details set to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'base58',
            maxSupportedTransactionVersion: 0,
            rewards: false,
            transactionDetails: 'full',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullBase58Versioned[];
    // @ts-expect-error `rewards` should be undefined
    response.rewards satisfies readonly Reward[];
}

// Tenth overload
// Rewards set to `false`
// Max supported transaction defaults to `legacy`
// Encoding set to `base58`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'base58',
            rewards: false,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullBase58Legacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForFullBase58Legacy & {
        version: 'legacy';
    })[];
    // @ts-expect-error `rewards` should be undefined
    response.rewards satisfies readonly Reward[];
}

// Tenth overload
// Rewards set to `false`
// Max supported transaction defaults to `legacy`
// Encoding set to `base58`
// Transaction details set to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'base58',
            rewards: false,
            transactionDetails: 'full',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullBase58Legacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForFullBase58Legacy & {
        version: 'legacy';
    })[];
    // @ts-expect-error `rewards` should be undefined
    response.rewards satisfies readonly Reward[];
}

// Eleventh overload
// Rewards defaults to `true`
// Max supported transaction version set to 0
// Encoding set to `base58`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'base58',
            maxSupportedTransactionVersion: 0,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullBase58Versioned[];
    response.rewards satisfies readonly Reward[];
}

// Eleventh overload
// Rewards set to `true`
// Max supported transaction version set to 0
// Encoding set to `base58`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'base58',
            maxSupportedTransactionVersion: 0,
            rewards: true,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullBase58Versioned[];
    response.rewards satisfies readonly Reward[];
}

// Twelfth overload
// Rewards defaults to `true`
// Max supported transaction defaults to `legacy`
// Encoding set to `base58`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'base58',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullBase58Legacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForFullBase58Legacy & {
        version: 'legacy';
    })[];
    response.rewards satisfies readonly Reward[];
}

// Twelfth overload
// Rewards set to `true`
// Max supported transaction defaults to `legacy`
// Encoding set to `base58`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'base58',
            rewards: true,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullBase58Legacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForFullBase58Legacy & {
        version: 'legacy';
    })[];
    response.rewards satisfies readonly Reward[];
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
    preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    preTokenBalances?: readonly TokenBalance[];
    postTokenBalances?: readonly TokenBalance[];
    rewards: readonly Reward[] | null;
    returnData?: Readonly<{
        programId: Base58EncodedAddress;
        data: Base64EncodedDataResponse;
    }>;
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
                      writable: readonly Base58EncodedAddress[];
                      readonly: readonly Base58EncodedAddress[];
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
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
            rewards: false,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullBase64Versioned[];
    // @ts-expect-error `rewards` should be undefined
    response.rewards satisfies readonly Reward[];
}

// Thirteenth overload
// Rewards set to `false`
// Max supported transaction version set to 0
// Encoding set to `base64`
// Transaction details set to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
            rewards: false,
            transactionDetails: 'full',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullBase64Versioned[];
    // @ts-expect-error `rewards` should be undefined
    response.rewards satisfies readonly Reward[];
}

// Fourteenth overload
// Rewards set to `false`
// Max supported transaction defaults to `legacy`
// Encoding set to `base64`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'base64',
            rewards: false,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullBase64Legacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForFullBase64Legacy & {
        version: 'legacy';
    })[];
    // @ts-expect-error `rewards` should be undefined
    response.rewards satisfies readonly Reward[];
}

// Fourteenth overload
// Rewards set to `false`
// Max supported transaction defaults to `legacy`
// Encoding set to `base64`
// Transaction details set to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'base64',
            rewards: false,
            transactionDetails: 'full',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullBase64Legacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForFullBase64Legacy & {
        version: 'legacy';
    })[];
    // @ts-expect-error `rewards` should be undefined
    response.rewards satisfies readonly Reward[];
}

// Fifteenth overload
// Rewards defaults to `true`
// Max supported transaction version set to 0
// Encoding set to `base64`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullBase64Versioned[];
    response.rewards satisfies readonly Reward[];
}

// Sixteenth overload
// Rewards defaults to `true`
// Max supported transaction defaults to `legacy`
// Encoding set to `base64`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'base64',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullBase64Legacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForFullBase64Legacy & {
        version: 'legacy';
    })[];
    response.rewards satisfies readonly Reward[];
}

type ExpectedParsedTransactionInstruction = Readonly<{
    parsed: {
        type: string;
        info?: object;
    };
    program: string;
    programId: Base58EncodedAddress;
}>;

type ExpectedPartiallyDecodedTransactionInstruction = Readonly<{
    accounts: readonly Base58EncodedAddress[];
    data: Base58EncodedBytes;
    programId: Base58EncodedAddress;
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
    preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    preTokenBalances?: readonly TokenBalance[];
    postTokenBalances?: readonly TokenBalance[];
    rewards: readonly Reward[] | null;
    returnData?: Readonly<{
        programId: Base58EncodedAddress;
        data: Base64EncodedDataResponse;
    }>;
    status: TransactionStatus;
};

type ExpectedMetaForFullJsonParsedLoadedAddresses = Readonly<{
    loadedAddresses: {
        writable: readonly Base58EncodedAddress[];
        readonly: readonly Base58EncodedAddress[];
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
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'jsonParsed',
            maxSupportedTransactionVersion: 0,
            rewards: false,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullJsonParsedVersioned[];
    // @ts-expect-error `rewards` should be undefined
    response.rewards satisfies readonly Reward[];
}

// Eighteenth overload
// Rewards set to `false`
// Max supported transaction defaults to `legacy`
// Encoding set to `jsonParsed`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'jsonParsed',
            rewards: false,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullJsonParsedLegacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForFullJsonParsedLegacy & {
        version: 'legacy';
    })[];
    // @ts-expect-error `rewards` should be undefined
    response.rewards satisfies readonly Reward[];
}

// Nineteenth overload
// Rewards defaults to `true`
// Max supported transaction version set to 0
// Encoding set to `jsonParsed`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'jsonParsed',
            maxSupportedTransactionVersion: 0,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions[0].transaction;
    response.transactions satisfies readonly ExpectedTransactionForFullJsonParsedVersioned[];
    response.rewards satisfies readonly Reward[];
}

// Twentieth overload
// Rewards defaults to `true`
// Max supported transaction defaults to `legacy`
// Encoding set to `jsonParsed`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'jsonParsed',
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullJsonParsedLegacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForFullJsonParsedLegacy & {
        version: 'legacy';
    })[];
    response.rewards satisfies readonly Reward[];
}

type ExpectedTransactionInstructionForFullJson = {
    programIdIndex: number;
    accounts: readonly number[];
    data: Base58EncodedBytes;
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
    preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    preTokenBalances?: readonly TokenBalance[];
    postTokenBalances?: readonly TokenBalance[];
    rewards: readonly Reward[] | null;
    returnData?: Readonly<{
        programId: Base58EncodedAddress;
        data: Base64EncodedDataResponse;
    }>;
    status: TransactionStatus;
};

type ExpectedMetaForFullJsonLoadedAddresses = Readonly<{
    loadedAddresses: {
        writable: readonly Base58EncodedAddress[];
        readonly: readonly Base58EncodedAddress[];
    };
}>;

type ExpectedTransactionForFullJsonBase = {
    message: {
        accountKeys: readonly Base58EncodedAddress[];
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
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            maxSupportedTransactionVersion: 0,
            rewards: false,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullJsonVersioned[];
    // @ts-expect-error `rewards` should be undefined
    response.rewards satisfies readonly Reward[];
}

// Twenty-first overload
// Rewards set to `false`
// Max supported transaction version set to 0
// Encoding set to `json`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            encoding: 'json',
            maxSupportedTransactionVersion: 0,
            rewards: false,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullJsonVersioned[];
    // @ts-expect-error `rewards` should be undefined
    response.rewards satisfies readonly Reward[];
}

// Twenty-second overload
// Rewards set to `false`
// Max supported transaction defaults to `legacy`
// Encoding defaults to `json`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            rewards: false,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullJsonLegacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForFullJsonLegacy & {
        version: 'legacy';
    })[];
    // @ts-expect-error `rewards` should be undefined
    response.rewards satisfies readonly Reward[];
}

// Twenty-third overload
// Rewards defaults to `true`
// Max supported transaction version set to 0
// Encoding defaults to `json`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
            maxSupportedTransactionVersion: 0,
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullJsonVersioned[];
    response.rewards satisfies readonly Reward[];
}

// Twenty-fourth overload
// Rewards defaults to `true`
// Max supported transaction defaults to `legacy`
// Encoding defaults to `json`
// Transaction details defaults to `full`
{
    const response = mockTypeTestResponse(
        rpc.getBlock(0n, {
            // No extra configs
        })
    );
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullJsonLegacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForFullJsonLegacy & {
        version: 'legacy';
    })[];
    response.rewards satisfies readonly Reward[];
}

// Twenty-fifth overload
// No configs
{
    const response = mockTypeTestResponse(rpc.getBlock(0n));
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullJsonLegacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForFullJsonLegacy & {
        version: 'legacy';
    })[];
    response.rewards satisfies readonly Reward[];
}

// Twenty-fifth overload with configs
{
    const response = mockTypeTestResponse(rpc.getBlock(0n, { commitment: 'confirmed' }));
    assert(response);
    assertBase(response);
    response.transactions satisfies readonly ExpectedTransactionForFullJsonLegacy[];
    // @ts-expect-error `version` should be undefined
    response.transactions satisfies readonly (ExpectedTransactionForFullJsonLegacy & {
        version: 'legacy';
    })[];
    response.rewards satisfies readonly Reward[];
}
