// When building the browser bundle, this import gets replaced by `globalThis.fetch`.
import fetchImpl from 'node-fetch';

export default typeof globalThis.fetch === 'function'
    ? // The Fetch API is supported experimentally in Node 17.5+ and natively in Node 18+.
      globalThis.fetch
    : // Otherwise use the polyfill.
      fetchImpl;
