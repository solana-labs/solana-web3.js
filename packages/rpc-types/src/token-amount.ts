import { StringifiedBigInt } from './stringified-bigint';
import { StringifiedNumber } from './stringified-number';

export type TokenAmount = Readonly<{
    amount: StringifiedBigInt;
    decimals: number;
    uiAmount: number | null;
    uiAmountString: StringifiedNumber;
}>;
