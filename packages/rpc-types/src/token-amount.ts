import { StringifiedBigInt } from './stringified-bigint.js';
import { StringifiedNumber } from './stringified-number.js';

export type TokenAmount = Readonly<{
    amount: StringifiedBigInt;
    decimals: number;
    uiAmount: number | null;
    uiAmountString: StringifiedNumber;
}>;
