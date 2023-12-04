#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
NEXT_VERSION=$1

# STEP 1
# Build all of the legacy packages
pnpm turbo compile:js compile:typedefs

for path in `find $BASEDIR/../../ -maxdepth 1 -mindepth 1 -type d -not -name library -not -name shared`; do
  (cd $path &&
    # STEP 2
    # Inject the version into the package.json
    pnpm version $NEXT_VERSION &&

    # STEP 3
    # Patch up the name of the package to remove the `-legacy` suffix
    cat <<< $(jq ".name = \"$(jq -r '.name' package.json | sed s/-legacy//)\"" package.json) > package.json &&
    pnpm prettier --write package.json &&

    # STEP 4
    # Publish the dependency to npm
    pnpm publish --access public --no-git-checks
  )
done