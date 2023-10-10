#!/usr/bin/env bash

set -ex

TARGET_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")/.." ; pwd -P )/.solana

# setup environment
version=$(curl -s "https://api.github.com/repos/solana-labs/solana/releases" | \
      grep '"tag_name": "v1.17.' | \
      sort -t. -k3,3nr | \
      head -n1 | \
      awk -F\" '{print $4}')
sh -c "$(curl -sSfL https://release.solana.com/$version/install)" init $version --data-dir $TARGET_DIR --no-modify-path
$TARGET_DIR/active_release/bin/solana --version
