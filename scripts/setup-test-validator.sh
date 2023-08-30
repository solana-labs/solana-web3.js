#!/usr/bin/env bash

set -ex

TARGET_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")/.." ; pwd -P )/.solana

# setup environment
version=$(curl -s -N https://api.github.com/repos/solana-labs/solana/releases/latest \
    | grep -m 1 \"tag_name\" \
    | sed -ne 's/^ *"tag_name": "\([^"]*\)",$/\1/p')
sh -c "$(curl -sSfL https://release.solana.com/$version/install)" init $version --data-dir $TARGET_DIR --no-modify-path
$TARGET_DIR/active_release/bin/solana --version
