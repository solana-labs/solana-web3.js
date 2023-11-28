export function getUnimplementedError(name: string) {
    return new Error(
        `${name} is unimplemented in \`@solana/web3.js-legacy-sham\`. If the caller of this ` +
            "method is code that you don't maintain, and part of a dependency that you can " +
            'not replace, let us know: ' +
            'https://github.com/solana-labs/solana-web3.js/issues/new/choose'
    );
}

export function createUnimplementedFunction(name: string) {
    return () => {
        throw getUnimplementedError(name);
    };
}
