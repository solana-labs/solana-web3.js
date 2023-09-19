import { getBaseXCodec, getBaseXDecoder, getBaseXEncoder } from './baseX';

const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/** Encodes strings in base58. */
export const getBase58Encoder = () => getBaseXEncoder(alphabet);

/** Decodes strings in base58. */
export const getBase58Decoder = () => getBaseXDecoder(alphabet);

/** Encodes and decodes strings in base58. */
export const getBase58Codec = () => getBaseXCodec(alphabet);
