describe('transaction', () => {
    describe('basic queries', () => {
        it.todo("can query a transaction's slot");
        it.todo("can query a transaction's block time");
        it.todo("can query a transaction's computeUnitsConsumed from it's meta");
        it.todo("can query several fields from a transaction's meta");
    });
    describe('transaction data queries', () => {
        it.todo('can get a transaction as base58');
        it.todo('can get a transaction as base64');
        it.todo('can get a transaction as json');
        it.todo('can get a transaction as jsonParsed');
        it.todo('defaults to jsonParsed');
    });
    describe('specific transaction instruction queries', () => {
        it.todo('can get a partially decoded instruction');
        it.todo('can get a specific instruction');
    });
});
