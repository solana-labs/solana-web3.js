# @solana/rpc-graphql

This package defines a GraphQL client resolver built on top of the
[Solana JSON-RPC](https://docs.solana.com/api/http).

GraphQL is a query language for your API, and a server-side runtime for
executing queries using a type system you define for your data.

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/GraphQL_Logo.svg/1024px-GraphQL_Logo.svg.png?20161105194737" alt="graphql-icon" width="24" align="center"/> [**GraphQL**](https://graphql.org/learn/)

This library attempts to define a type schema for Solana. With the proper
type schema, developers can take advantage of the best features of GraphQL
to make interacting with Solana via RPC smoother, faster, more reliable,
and involve less code.

# Design

On-chain data can be categorized into three main types:

- Accounts
- Transactions
- Blocks

These types encompass everything that can be queried from the Solana ledger.

The Solana RPC provides a parsing method known as `jsonParsed` for supported
types, such as accounts and transaction instructions.

This library leverages GraphQL **interfaces** for each of these types paired
with specific GraphQL types for each `jsonParsed` object. This allows for
powerful querying of `jsonParsed` data, including nested and chained queries!

## Setting up a GraphQL RPC Client

Initializing an RPC-GraphQL using `@solana/rpc-graphql` requires an RPC client,
either built using `@solana/web3.js` or it's child libraries `@solana/rpc-core`
and `@solana/rpc-transport`.

```typescript
import { createSolanaRpc, createDefaultRpcTransport } from '@solana/web3.js';
import { createRpcGraphQL } from '@solana/rpc-graphql';

// Set up an HTTP transport
const transport = createDefaultRpcTransport({ url: 'http://127.0.0.1:8899' });

// Create the RPC client
const rpc = createSolanaRpc({ transport });

// Create the RPC-GraphQL client
const rpcGraphQL = createRpcGraphQL(rpc);
```

The `RpcGraphQL` type supports one method `query(..)` which accepts a string
query source and an optional `variableValues` parameter - which is an object
containing any variables to pipe into the query string.

You can define queries with hard-coded parameters.

```typescript
const source = `
    query myQuery {
        account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
            lamports
        }
    }
`;

const result = await rpcGraphQL.query(source);
```

```
data: {
    account: {
        lamports: 10290815n,
    },
}
```

You can also pass the variable values.

```typescript
const source = `
    query myQuery($address: String!) {
        account(address: $address) {
            lamports
        }
    }
`;

const variableValues = {
    address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
};

const result = await rpcGraphQL.query(source, variableValues);
```

```
data: {
    account: {
        lamports: 10290815n,
    },
}
```

Queries with variable values can also be re-used!

```typescript
const source = `
    query myQuery($address: String!) {
        account(address: $address) {
            lamports
        }
    }
`;

const lamportsAccountA = await rpcGraphQL.query(source, {
    address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
});

const lamportsAccountB = await rpcGraphQL.query(source, {
    address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
});
```

## Querying Accounts

The `Account` interface contains common fields across all accounts.

`src/schema/account/types.ts: AccountInterface`

```graphql
interface Account {
    address: String
    encoding: String
    executable: Boolean
    lamports: BigInt
    owner: Account
    rentEpoch: BigInt
}
```

Any account can be queried by these fields without specifying the specific
account type.

```typescript
const source = `
    query myQuery($address: String!) {
        account(address: $address) {
            executable
            lamports
            rentEpoch
        }
    }
`;

const variableValues = {
    address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
};

const result = await rpcGraphQL.query(source, variableValues);
```

```
data: {
    account: {
        executable: false,
        lamports: 10290815n,
        rentEpoch: 0n,
    },
}
```

### Specific Account Types

Each `jsonParsed` account type has its own GraphQL type that can be used in a
GraphQL query.

- `AccountBase58`: A Solana account with base58 encoded data
- `AccountBase64`: A Solana account with base64 encoded data
- `AccountBase64Zstd`: A Solana account with base64 encoded data compressed with zstd
- `NonceAccount`: A nonce account
- `LookupTableAccount`: An address lookup table account
- `MintAccount`: An SPL mint
- `TokenAccount`: An SPL token account
- `StakeAccount`: A stake account
- `VoteAccount`: A vote account

You can choose how to handle querying of specific account types. For example,
you might _only_ want specifically any account that matches `MintAccount`.

```typescript
const maybeMintAddresses = [
    'J7iup799j5BVjKXACZycYef7WQ4x1wfzhUsc5v357yWQ',
    'JAbWqZ7S2c6jomQr8ofAYBo257bE1QJtHwbX1yWc2osZ',
    '2AQ4CSNu6zNUZsUq4aLNUSjyrLv4qFFXQuKs5RTHbg2Y',
    'EVW3CoyogapBfQxBFFEKGMM1bn3JyoFiqkAJdw3FHX1b',
];

const mintAccounts = [];

const source = `
    query myQuery($address: String!) {
        account(address: $address) {
            ... on MintAccount {
                data {
                    decimals
                    isInitialized
                    mintAuthority
                    supply
                }
            }
        }
    }
`;

for (const address of maybeMintAddresses) {
    const result = await rpcGraphQL.query(source, { address });
    if (result != null) {
        const {
            data: {
                account: {
                    data: mintInfo,
                },
            },
        } = result;
        mintAccounts.push(mintInfo);
    }
}
```

Maybe you want to handle both mints _and_ token accounts.

```typescript
const mintOrTokenAccountAddresses = [
    'J7iup799j5BVjKXACZycYef7WQ4x1wfzhUsc5v357yWQ',
    'JAbWqZ7S2c6jomQr8ofAYBo257bE1QJtHwbX1yWc2osZ',
    '2AQ4CSNu6zNUZsUq4aLNUSjyrLv4qFFXQuKs5RTHbg2Y',
    'EVW3CoyogapBfQxBFFEKGMM1bn3JyoFiqkAJdw3FHX1b',
];

const mintAccounts = [];
const tokenAccounts = [];

const source = `
    query myQuery($address: String!) {
        account(address: $address) {
            ... on MintAccount {
                data {
                    decimals
                    isInitialized
                    supply
                }
                meta {
                    type
                }
            }
            ... on TokenAccount {
                data {
                    isNative
                    mint
                    state
                }
                meta {
                    type
                }
            }
        }
    }
`;

for (const address of mintOrTokenAccountAddresses) {
    const result = await rpcGraphQL.query(source, { address });
    if (result != null) {
        const {
            data: {
                account: {
                    data: accountParsedInfo,
                    meta: {
                        type: accountType,
                    }
                }
            }
        } = result;
        if (accountType === 'mint') {
            mintAccounts.push(accountParsedInfo)
        } else {
            tokenAccounts.push(accountParsedInfo)
        }
    }
}
```

Querying accounts by their encoded data (`base58`, `base64`, `base64+zstd`) is
still fully supported.

```typescript
const source = `
    query myQuery($address: String!, $encoding: AccountEncoding) {
        account(address: $address, encoding: $encoding) {
            ... on AccountBase64 {
                data
            }
        }
    }
`;

const variableValues = {
    address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
    encoding: 'base64',
};

const result = await rpcGraphQL.query(source, variableValues);
```

```
data: {
    account: {
        data: 'dGVzdCBkYXRh',
    },
}
```

### Nested Account Queries

Notice the `owner` field of the `Account` interface is also an `Account`
interface. This powers nested queries against the `owner` field of an account.

```typescript
const source = `
    query myQuery($address: String!) {
        account(address: $address) {
            address
            owner {
                address
                executable
                lamports
            }
        }
    }
`;

const variableValues = {
    address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
};

const result = await rpcGraphQL.query(source, variableValues);
```

```
data: {
    account: {
        address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
        owner: {
            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            executable: true,
            lamports: 10290815n,
        },
    },
}
```

As you can see, simply defining a nested query with RPC-GraphQL will augment
the multiple RPC calls and parsing code required to gather the necessary
information!

You can nest queries as far as you want!

```typescript
const source = `
    query myQuery($address: String!) {
        account(address: $address) {
            address
            owner {
                address
                owner {
                    address
                    owner {
                        address
                    }
                }
            }
        }
    }
`;

const variableValues = {
    address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
};

const result = await rpcGraphQL.query(source, variableValues);
```

```
data: {
    account: {
        address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
        owner: {
            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            owner: {
                address: 'BPFLoader2111111111111111111111111111111111',
                owner: {
                    address: 'NativeLoader1111111111111111111111111111111',
                },
            },
        },
    },
}
```

Nested queries can also be applied to specific account types.

```typescript
const source = `
    query myQuery($address: String!) {
        account(address: $address) {
            ... on MintAccount {
                address
                data {
                    mintAuthority {
                        address
                        lamports
                    }
                }
            }
        }
    }
`;

const variableValues = {
    address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
};

const result = await rpcGraphQL.query(source, variableValues);
```

```
data: {
    account: {
        address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
        data: {
            mintAuthority: {
                address: 'DpfJkNonoVB3sor9H9ceajhex4XHVPrDAGAq2ahdG4JZ',
                lamports: 10290815n,
            }
        },
    },
}
```

## Querying Program Accounts

A very common way to query Solana accounts from an RPC is to request all of
the accounts owned by a particular program.

With RPC-GraphQL, querying program-owned accounts is a list-based extension of
the account query defined previously. This means program accounts queries will
return a list of objects implementing the `Account` interface.

Setting up the query is very similar to the `account` query.

```typescript
const source = `
    query myQuery($programAddress: String!) {
        programAccounts(programAddress: $address) {
            executable
            lamports
            rentEpoch
        }
    }
`;

const variableValues = {
    programAddress: 'AmtpVzo6H6qQCP9dH9wfu5hfa8kKaAFpTJ4aamPYR6V6',
};

const result = await rpcGraphQL.query(source, variableValues);
```

```
data: {
    programAccounts: [
        {
            executable: false,
            lamports: 10290815n,
            rentEpoch: 0n,
        },
        {
            executable: false,
            lamports: 10290815n,
            rentEpoch: 0n,
        }
    ]
}
```

### Specific Program Account Types

Although specific parsed account types are directly tied to the program which
owns them, it's still possible to handle various specific account types within
the same program accounts response.

```typescript
const source = `
    query myQuery($programAddress: String!) {
        programAccounts(programAddress: $address) {
            ... on MintAccount {
                data {
                    decimals
                    isInitialized
                    mintAuthority
                    supply
                }
                meta {
                    type
                }
            }
            ... on TokenAccount {
                data {
                    isNative
                    mint
                    owner
                    state
                }
                meta {
                    type
                }
            }
        }
    }
`;

const variableValues = {
    programAddress: 'AmtpVzo6H6qQCP9dH9wfu5hfa8kKaAFpTJ4aamPYR6V6',
};

const result = await rpcGraphQL.query(source, variableValues);

const { mints, tokenAccounts } = result.data.programAccounts.reduce(
  (acc: { mints: any[]; tokenAccounts: any[] }, account) => {
    const {
        data: accountParsedInfo,
        meta: {
            type: accountType,
        }
    } = account;
    if (accountType === "mint") {
      acc.mints.push(accountParsedInfo);
    } else {
      acc.tokenAccounts.push(accountParsedInfo);
    }
    return acc;
  },
  { mints: [], tokenAccounts: [] }
);
```

Account data encoding in `base58`, `base64`, and `base64+zstd` is also
supported, as well as `dataSlice` and `filter`!

```typescript
const source = `
    query myQuery(
        $programAddress: String!,
        $commitment: Commitment,
        $dataSlice: DataSlice,
        $encoding: AccountEncoding,
    ) {
        programAccounts(
            programAddress: $programAddress,
            commitment: $commitment,
            dataSlice: $dataSlice,
            encoding: $encoding,
        ) {
            ... on AccountBase64 {
                data
            }
        }
    }
`;

const variableValues = {
    programAddress: 'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
    commitment: 'confirmed',
    dataSlice: {
        length: 5,
        offset: 0,
    },
    encoding: 'base64',
};

const result = await rpcGraphQL.query(source, variableValues);
```

```
data: {
    programAccounts: [
        {
            data: 'dGVzdCA=',
        },
    ],
}
```

### Nested Program Account Queries

Querying program accounts and applying nested queries to the objects within the
response list is an area where RPC-GraphQL really shines.

Consider an example where we want to get the **sum** of every lamports balance
of every **owner of the owner** of each token account, while discarding any
mint accounts.

```typescript
const source = `
    query getLamportsOfOwnersOfOwnersOfTokenAccounts {
        programAccounts(programAddress: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") {
            ... on TokenAccount {
                data {
                    owner {
                        owner {
                            lamports
                        }
                    }
                }
            }
        }
    }
`;

const result = await rpcGraphQL.query(source);

const sumOfAllLamportsOfOwnersOfOwnersOfTokenAccounts = result.data
    .map(o => o.account.data.owner.owner.lamports)
    .reduce((acc, lamports) => acc + lamports, 0);
```

## Querying Transactions

The `Transaction` interface contains common fields across all transactions.

`src/schema/transaction/types.ts: TransactionInterface`

```graphql
interface Transaction {
    blockTime: String
    encoding: String
    meta: TransactionMeta
    slot: BigInt
}
```

Similar to account types, any transaction can be queried by these fields
without specifying the specific transaction type or the transaction meta
type.

```typescript
const source = `
    query myQuery($signature: String!, $commitment: Commitment) {
        transaction(signature: $signature, commitment: $commitment) {
            blockTime
            meta {
                computeUnitsConsumed
                logMessages
            }
            slot
        }
    }
`;

const variableValues = {
    signature: '63zkpxATgAwXRGFQZPDESTw2m4uZQ99sX338ibgKtTcgG6v34E3MSS3zckCwJHrimS71cvei6h1Bn1K1De53BNWC',
    commitment: 'confirmed',
};

const result = await rpcGraphQL.query(source, variableValues);
```

```
data: {
    transaction: {
        blockTime: 230860412n,
        meta: {
            computeUnitsConsumed: 120000n,
            logMessages: [
                "Program 8tfDNiaEyrV6Q1U4DEXrEigs9DoDtkugzFbybENEbCDz invoke [1]",
                "Program 8tfDNiaEyrV6Q1U4DEXrEigs9DoDtkugzFbybENEbCDz consumed 2164 of 452155 compute units",
                "Program 8tfDNiaEyrV6Q1U4DEXrEigs9DoDtkugzFbybENEbCDz success",
                "Program ComputeBudget111111111111111111111111111111 invoke [1]",
                "Program ComputeBudget111111111111111111111111111111 success"
            ]
        },
        slot: 230860693n,
    },
}
```

### Specific Transaction Types

Each `jsonParsed` instruction type has its own GraphQL type that can be used in
a GraphQL transaction query.

Instructions for the following programs are supported.

- Address Lookup Table
- BPF Loader
- BPF Upgradeable Loader
- Stake
- SPL Associated Token
- SPL Memo
- SPL Token
- System
- Vote

Note at this time Token 2022 extensions are not yet supported.

Similar to accounts, transactions with encoded data are also supported.

- `TransactionBase58`: A Solana transaction with base58 encoded data
- `TransactionBase64`: A Solana transaction with base64 encoded data
- `TransactionJson`: A Solana transaction with JSON data

Specific instruction types can be used in the transaction's instructions. The
default instruction if it cannot be parsed using `jsonParsed` is the JSON
version dubbed `GenericInstruction`.

```typescript
const source = `
    query myQuery($signature: String!, $commitment: Commitment) {
        transaction(signature: $signature, commitment: $commitment) {
            ... on TransactionParsed {
                data {
                    message {
                        accountKeys {
                            pubkey
                            signer
                            source
                            writable
                        }
                        instructions {
                            ... on GenericInstruction {
                                accounts
                                data
                                programId
                            }
                        }
                    }
                }
            }
        }
    }
`;

const variableValues = {
    signature: '63zkpxATgAwXRGFQZPDESTw2m4uZQ99sX338ibgKtTcgG6v34E3MSS3zckCwJHrimS71cvei6h1Bn1K1De53BNWC',
    commitment: 'confirmed',
};
                                        
const result = await rpcGraphQL.query(source, variableValues);
```

```
data: {
    transaction: {
        data: {
            message: {
                accountKeys: [
                    {
                        pubkey: '81EBmTWaMkFqW6LPNPfU2478nJkrhCLuiFUPSdvQKQj7',
                        signer: false,
                        source: 'transaction',
                        writable: true,
                    },
                    {
                        pubkey: 'G6TmQyEoxbUzdyncwxVN9GgfALpYErHSkXZeqJj7fwFz',
                        signer: true,
                        source: 'transaction',
                        writable: true,
                    },
                ],
                instructions: [
                    {
                        accounts: [
                            '81EBmTWaMkFqW6LPNPfU2478nJkrhCLuiFUPSdvQKQj7',
                            'G6TmQyEoxbUzdyncwxVN9GgfALpYErHSkXZeqJj7fwFz'
                        ]
                        data: 'WzIsIDU0LCA5LCAgNzYsIDM1LCA2NCwgOCwgOCwgNCwgMywgMiwgNV0=',
                        programId: 'EksBYH1iSR8farQc9X26pYrXotj1D2JjXGuj8uM8xMcb',
                    }
                ]
            },
        },
    },
}
```

However, whenever JSON-parseable instructions are present in the list of
instructions, they can be queried using specific instruction types.

```typescript
const source = `
    query myQuery($signature: String!, $commitment: Commitment) {
        transaction(signature: $signature, commitment: $commitment) {
            ... on TransactionParsed {
                data {
                    message {
                        instructions {
                            ... on CreateAccountInstruction {
                                data {
                                    lamports
                                    space
                                }
                                meta {
                                    program
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

const variableValues = {
    signature: '63zkpxATgAwXRGFQZPDESTw2m4uZQ99sX338ibgKtTcgG6v34E3MSS3zckCwJHrimS71cvei6h1Bn1K1De53BNWC',
    commitment: 'confirmed',
};
                                        
const result = await rpcGraphQL.query(source, variableValues);
```

```
data: {
    transaction: {
        data: {
            message: {
                instructions: [
                    {
                        data: {
                            lamports: 890880n,
                            space: 0n,
                        },
                        meta: {
                            program: 'system',
                        },
                    }
                ]
            },
        },
    },
}
```

Querying transactions by their encoded data (`base58`, `base64`, `json`) is
still fully supported.

```typescript
const source = `
    query myQuery(
        $signature: String!,
        $commitment: Commitment,
        $encoding: TransactionEncoding!,
    ) {
        transaction(
            signature: $signature,
            commitment: $commitment,
            encoding: $encoding,
        ) {
            ... on TransactionBase64 {
                data
            }
        }
    }
`;

const variableValues = {
    signature: '63zkpxATgAwXRGFQZPDESTw2m4uZQ99sX338ibgKtTcgG6v34E3MSS3zckCwJHrimS71cvei6h1Bn1K1De53BNWC',
    commitment: 'confirmed',
    encoding: 'base64',
};
                                        
const result = await rpcGraphQL.query(source, variableValues);
```

```
data: {
    transaction: {
        data: 'WzIsIDU0LCA5LCAgNzYsIDM1LCA2NCwgOCwgOCwgNCwgMywgMiwgNV0=',
    },
}
```

### Nested Transaction Queries

Since transactions have a relatively large number of data points, they are
particularly useful for nested queries!

Similar to nested querying accounts, it's possible to nest queries inside your
transaction queries to look up other objects, such as accounts, as they appear
in the transaction response.

```typescript
const source = `
    query myQuery($signature: String!, $commitment: Commitment) {
        transaction(signature: $signature, commitment: $commitment) {
            ... on TransactionParsed {
                data {
                    message {
                        instructions {
                            ... on SplTokenTransferInstruction {
                                data {
                                    amount
                                    authority {
                                        address
                                        lamports
                                    }
                                    destination {
                                        ... on TokenAccount {
                                            data {
                                                address
                                                mint {
                                                    ... on MintAccount {
                                                        data {
                                                            address
                                                            decimals
                                                        }
                                                    }
                                                }
                                                owner {
                                                    address
                                                    lamports
                                                }
                                            }
                                        }
                                    }
                                    source {
                                        ... on TokenAccount {
                                            data {
                                                address
                                                mint {
                                                    ... on MintAccount {
                                                        data {
                                                            address
                                                            decimals
                                                        }
                                                    }
                                                }
                                                owner {
                                                    address
                                                    lamports
                                                }
                                            }
                                        }
                                    }
                                }
                                meta {
                                    program
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

const variableValues = {
    signature: '63zkpxATgAwXRGFQZPDESTw2m4uZQ99sX338ibgKtTcgG6v34E3MSS3zckCwJHrimS71cvei6h1Bn1K1De53BNWC',
    commitment: 'confirmed',
};
                                        
const result = await rpcGraphQL.query(source, variableValues);
```

```
data: {
    transaction: {
        data: {
            message: {
                instructions: [
                    {
                        data: {
                            amount: '50',
                            authority: {
                                address: 'AHPPMhzDQix9sKULBqeaQ5BUZgrKdz8tg6DzPxsofB12',
                                lamports: 890880n,
                            },
                            destination: {
                                data: {
                                    address: '2W8mUY75zxqwAcpirn75r3Cc7TStMirFyHwKqo13fmB1',
                                    mint: data: {
                                        address: '8poKMotB2cEYVv5sbjrdyssASZj1vwYCe7GJFeXo2QP7',
                                        decimals: 6,
                                    },
                                    owner: {
                                        address: '7tRxJ2znbTFpwW9XaMMiDsXDudoPEUXRcpDpm8qjWgAZ',
                                        lamports: 890880n,
                                    },
                                }
                            },
                            source: {
                                data: {
                                    parsed: {
                                        info: {
                                            address: 'BqFCPqXUm4cq6jaZZx1TDTvUR1wdEuNNwAHBEVR6mJhM',
                                            mint: data: {
                                                address: '8poKMotB2cEYVv5sbjrdyssASZj1vwYCe7GJFeXo2QP7',
                                                decimals: 6,
                                            },
                                            owner: {
                                                address: '3dPmVLMD7PC5faZNyJUH9WFrUxAsbjydJfoozwmR1wDG',
                                                lamports: e890880n,
                                            },
                                        }
                                    }
                                }
                            },
                        },
                        meta: {
                            program: 'spl-token',
                        }
                    }
                ]
            },
        },
    },
}
```

## Querying Blocks

Querying blocks is very similar to querying transactions, since a block
contains a list of transactions. There's a bit more data at the highest level
for a block, but you can query the list of transactions using a block query and
transaction types in the same fashion you can query the lsit of accounts using
a program accounts query and account types.

```typescript
const source = `
    query myQuery($slot: BigInt!, $commitment: Commitment) {
        block(slot: $slot, commitment: $commitment) {
            blockHeight
            blockhash
            parentSlot
            rewards {
                commission
                lamports
                rewardType
            }
            transactions {
                ... on TransactionParsed {
                    data {
                        message {
                            instructions {
                                ... on CreateAccountInstruction {
                                    data {
                                        lamports
                                        space
                                    }
                                    meta {
                                        program
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

const variableValues = {
    slot: 43596n,
    commitment: 'confirmed',
};
                                        
const result = await rpcGraphQL.query(source, variableValues);
```

```
data: {
    block: {
        blockHeight: 196758578n,
        blockhash: 'BqFCPqXUm4cq6jaZZx1TDTvUR1wdEuNNwAHBEVR6mJhM',
        parentSlot: 230862408n,
        rewards: [
            {
                commission: 0.05,
                lamports: 58578n,
                rewardType: 'staking',
            },
            {
                commission: 0.05,
                lamports: 58578n,
                rewardType: 'staking',
            }
        ],
        transactions: [
            data: {
                    {
                    message: {
                        instructions: [
                            {
                                data: {
                                    lamports: 890880n,
                                    space: 0n,
                                },
                                meta: {
                                    program: 'system',
                                },
                            }
                        ]
                    },
                }
            }
        ],
    },
}
```