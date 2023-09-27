import { getBase16Encoder } from '@solana/codecs-strings';

export const b = (value: string) => getBase16Encoder().encode(value);
