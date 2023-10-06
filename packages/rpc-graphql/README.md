# @solana/rpc-graphql

This package defines a GraphQL client resolver built on top of the
[Solana JSON-RPC](https://docs.solana.com/api/http).

# Solana & GraphQL

GraphQL is a query language for your API, and a server-side runtime for
executing queries using a type system you define for your data.

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/GraphQL_Logo.svg/1024px-GraphQL_Logo.svg.png?20161105194737" alt="graphql-icon" width="24" align="center"/> [**GraphQL**](https://graphql.org/learn/)

This library attempts to define a type system for Solana. With the proper
type system, developers can take advantage of the best features of GraphQL
to make interacting with Solana via RPC smoother, faster, more reliable,
and involve less code.

## Design

⚠️ **In Development:** The API's query/schema structure may change as the API
matures.

With the exception of many familiar RPC methods for obtaining information about
a validator or cluster, majority of Solana data required by various
applications revolves around two components:

-   Accounts
-   Blocks

One can add a third component found within a block:

-   Transactions

With these three main components in mind, consider a GraphQL type system that
revolves around accounts, blocks, and transactions.

### Types

Coming soon!

#### Account

Coming soon!

### Queries

Coming soon!

#### Accounts

Coming soon!

#### Program Accounts

Coming soon!

#### Blocks

Coming soon!

#### Transactions

Coming soon!
