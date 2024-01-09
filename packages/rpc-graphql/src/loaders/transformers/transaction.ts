/* eslint-disable @typescript-eslint/no-explicit-any */

function transformParsedInstruction(parsedInstruction: any) {
    if ('parsed' in parsedInstruction) {
        if (typeof parsedInstruction.parsed === 'string' && parsedInstruction.program === 'spl-memo') {
            const { parsed: memo, program: programName, programId } = parsedInstruction;
            const instructionType = 'memo';
            return { instructionType, memo, programId, programName };
        }
        const {
            parsed: { info: data, type: instructionType },
            program: programName,
            programId,
        } = parsedInstruction;
        return { instructionType, programId, programName, ...data };
    } else {
        return parsedInstruction;
    }
}

function transformParsedTransaction(parsedTransaction: any) {
    const transactionData = parsedTransaction.transaction;
    const transactionMeta = parsedTransaction.meta;
    transactionData.message.instructions = transactionData.message.instructions.map(transformParsedInstruction);
    transactionMeta.innerInstructions = transactionMeta.innerInstructions.map((innerInstruction: any) => {
        innerInstruction.instructions = innerInstruction.instructions.map(transformParsedInstruction);
        return innerInstruction;
    });
    return [transactionData, transactionMeta];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformLoadedTransaction({ encoding, transaction }: { encoding: string; transaction: any }) {
    const [transactionData, transactionMeta] = Array.isArray(transaction.transaction)
        ? // The requested encoding is base58 or base64.
          [transaction.transaction[0], transaction.meta]
        : // The transaction was either partially parsed or
          // fully JSON-parsed, which will be sorted later.
          transformParsedTransaction(transaction);
    transaction.data = transactionData;
    transaction.encoding = encoding;
    transaction.meta = transactionMeta;
    return transaction;
}
