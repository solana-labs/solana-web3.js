# Solana JavaScript API

## Development Environment Setup

### Speed up build times with remote caching

Cache build artifacts remotely so that you, others, and the CI server can take advantage of each others' build efforts.

1. Log the Turborepo CLI into the Solana Vercel account
    ```bash
    pnpm turbo login
    ```
2. Link the repository to the remote cache
    ```bash
    pnpm turbo link
    ```
