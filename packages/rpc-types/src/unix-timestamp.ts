import { SOLANA_ERROR__TIMESTAMP_OUT_OF_RANGE, SolanaError } from '@solana/errors';

export type UnixTimestamp = bigint & { readonly __brand: unique symbol };

export function isUnixTimestamp(putativeTimestamp: bigint): putativeTimestamp is UnixTimestamp {
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date
    if (putativeTimestamp > 8.64e15 || putativeTimestamp < -8.64e15) {
        return false;
    }
    return true;
}

export function assertIsUnixTimestamp(putativeTimestamp: bigint): asserts putativeTimestamp is UnixTimestamp {
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date

    if (putativeTimestamp > 8.64e15 || putativeTimestamp < -8.64e15) {
        throw new SolanaError(SOLANA_ERROR__TIMESTAMP_OUT_OF_RANGE, {
            value: putativeTimestamp,
        });
    }
}

export function unixTimestamp(putativeTimestamp: bigint): UnixTimestamp {
    assertIsUnixTimestamp(putativeTimestamp);
    return putativeTimestamp;
}
