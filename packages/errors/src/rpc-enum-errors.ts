import { SolanaErrorCode } from './codes';
import { SolanaErrorContext } from './context';
import { SolanaError } from './error';
import { safeCaptureStackTrace } from './stack-trace';

type Config = Readonly<{
    /**
     * Oh, hello. You might wonder what in tarnation is going on here. Allow us to explain.
     *
     * One of the goals of `@solana/errors` is to allow errors that are not interesting to your
     * application to shake out of your app bundle in production. This means that we must never
     * export large hardcoded maps of error codes/messages.
     *
     * Unfortunately, where instruction and transaction errors from the RPC are concerned, we have
     * no choice but to keep a map between the RPC `rpcEnumError` enum name and its corresponding
     * `SolanaError` code. In the interest of implementing that map in as few bytes of source code
     * as possible, we do the following:
     *
     *   1. Reserve a block of sequential error codes for the enum in question
     *   2. Hardcode the list of enum names in that same order
     *   3. Match the enum error name from the RPC with its index in that list, and reconstruct the
     *      `SolanaError` code by adding the `errorCodeBaseOffset` to that index
     */
    errorCodeBaseOffset: number;
    getErrorContext: (
        errorCode: SolanaErrorCode,
        rpcErrorName: string,
        rpcErrorContext?: unknown,
    ) => SolanaErrorContext[SolanaErrorCode];
    orderedErrorNames: string[];
    rpcEnumError: string | { [key: string]: unknown };
}>;

export function getSolanaErrorFromRpcError(
    { errorCodeBaseOffset, getErrorContext, orderedErrorNames, rpcEnumError }: Config,
    // eslint-disable-next-line @typescript-eslint/ban-types
    constructorOpt: Function,
): SolanaError {
    let rpcErrorName;
    let rpcErrorContext;
    if (typeof rpcEnumError === 'string') {
        rpcErrorName = rpcEnumError;
    } else {
        rpcErrorName = Object.keys(rpcEnumError)[0];
        rpcErrorContext = rpcEnumError[rpcErrorName];
    }
    const codeOffset = orderedErrorNames.indexOf(rpcErrorName);
    const errorCode = (errorCodeBaseOffset + codeOffset) as SolanaErrorCode;
    const errorContext = getErrorContext(errorCode, rpcErrorName, rpcErrorContext);
    const err = new SolanaError(errorCode, errorContext);
    safeCaptureStackTrace(err, constructorOpt);
    return err;
}
