#!/usr/bin/env bash

set -ex

# setup environment
version=$(curl -s -N https://api.github.com/repos/solana-labs/solana/releases/latest \
    | grep -m 1 \"tag_name\" \
    | sed -ne 's/^ *"tag_name": "\([^"]*\)",$/\1/p')
sh -c "$(curl -sSfL https://release.solana.com/$version/install)"
PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana --version
