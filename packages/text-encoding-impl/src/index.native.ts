// When building the browser and node bundles, this import gets replaced by `globalThis.TextEncoder` and `globalThis.TextDecoder`.
import {
    TextDecoder as TextDecoderPolyfill,
    TextEncoder as TextEncoderPolyfill,
} from 'fastestsmallesttextencoderdecoder';

export const TextDecoder = TextDecoderPolyfill;
export const TextEncoder = TextEncoderPolyfill;
