// When building the browser bundle, this import gets replaced by `globalThis.crypto`.
import crypto from 'node:crypto';

export default crypto;
