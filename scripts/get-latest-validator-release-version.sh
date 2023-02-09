#!/usr/bin/env bash
(
    set -e
    version=$(curl -s -N https://api.github.com/repos/solana-labs/solana/releases/latest \
      | grep -m 1 \"tag_name\" \
      | sed -ne 's/^ *"tag_name": "\([^"]*\)",$/\1/p')
    if [ -z $version ]; then
      exit 3
    fi
    echo $version
)
errorCode=$?
if [ $errorCode -ne 0 ]; then
  # Bust the cache with a timestamp if no version could be found.
  echo $(date +%s)
fi