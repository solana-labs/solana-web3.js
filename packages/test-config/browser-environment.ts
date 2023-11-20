import { TestEnvironment } from 'jest-environment-jsdom';

export default class BrowserEnvironment extends TestEnvironment {
    async setup() {
        await super.setup();
        /**
         * Here we inject Node's `Uint8Array` as a global so that `instanceof` checks inside
         * `SubtleCrypto.digest()` work with `Uint8Array#buffer`. Read more here:
         * https://github.com/jestjs/jest/issues/7780#issuecomment-615890410
         */
        this.global.Uint8Array = globalThis.Uint8Array;
    }
}
