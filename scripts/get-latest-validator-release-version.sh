#!/usr/bin/env bash
(
    set -e
    version=$(curl -s "https://api.github.com/repos/solana-labs/solana/releases" | \
      grep '"tag_name": "v1.17.' | \
      sort -t. -k3,3nr | \
      head -n1 | \
      awk -F\" '{print $4}')
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