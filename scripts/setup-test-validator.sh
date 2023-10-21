#!/usr/bin/env bash

set -ex

TARGET_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")/.." ; pwd -P )/.solana

# setup environment
version=$(node -e \
  'fetch("https://api.github.com/repos/solana-labs/solana/releases").then(res => res.json().then(rs => rs.filter(r => !r.prerelease && r.tag_name.startsWith("v1.17."))).then(x => console.log(x[0].tag_name)));'
)
sh -c "$(curl -sSfL https://release.solana.com/$version/install)" init $version --data-dir $TARGET_DIR --no-modify-path
$TARGET_DIR/active_release/bin/solana --version
