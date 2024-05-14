function isDevelopment() {
    if (typeof process === 'object' && process.env) {
        // We use `'en' + 'v'` to prevent the build system from inlining the value of `NODE_ENV`
        return (process as any)['en' + 'v'].NODE_ENV === 'development';
    }
    // if no process.env, use dev mode
    return true;
}

export const __DEV__ = /* @__PURE__ */ isDevelopment();
