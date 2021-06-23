import type {RawRPCError} from './connection';

const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Error resulting from an RPC.
 */
export class RPCError extends Error {
  constructor(
    public readonly method: string,
    public readonly raw: RawRPCError,
    public readonly prefix?: string,
  ) {
    super(`${prefix ?? method}: ${raw.message}`);
    this.name = `${capitalize(method)}RPCError`;
  }
}

/**
 * Thrown when an RPC error occurs while sending a transaction.
 */
export class SendTransactionRPCError extends RPCError {
  constructor(public readonly raw: RawRPCError) {
    super('sendTransaction', raw, 'failed to send transaction');
  }

  /**
   * Program logs
   */
  get logs(): readonly string[] | null {
    const logs = this.raw.data.logs;
    if (logs && Array.isArray(logs)) {
      return logs;
    }
    return null;
  }

  /**
   * Prints the program trace.
   */
  public printTrace() {
    const logs = this.logs;
    if (logs) {
      const traceIndent = '\n    ';
      const logTrace = traceIndent + logs.join(traceIndent);
      console.error(this.raw.message, logTrace);
    }
  }
}
