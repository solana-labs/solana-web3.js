import { getBaseXCodec, getBaseXDecoder, getBaseXEncoder } from './baseX.js';

const alphabet = '0123456789';

/** Encodes strings in base10. */
export const getBase10Encoder = () => getBaseXEncoder(alphabet);

/** Decodes strings in base10. */
export const getBase10Decoder = () => getBaseXDecoder(alphabet);

/** Encodes and decodes strings in base10. */
export const getBase10Codec = () => getBaseXCodec(alphabet);
