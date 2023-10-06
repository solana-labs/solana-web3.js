describe('blockNotifications', () => {
    (
        ['all', { mentionsAccountOrProgram: 'Vote111111111111111111111111111111111111111' }] as (
            | 'all'
            | { mentionsAccountOrProgram: string }
        )[]
    ).forEach(filter => {
        describe(`filter: ${JSON.stringify(filter)}`, () => {
            describe('when `transactionDetails` is set to `none`', () => {
                describe('when called with rewards set to false', () => {
                    it.todo('returns an empty array for transactions and an empty array for rewards');
                });

                describe('when called with rewards set to true', () => {
                    it.todo('returns no transactions and an array of rewards for rewards');
                });
            });

            describe('when `transactionDetails` is set to `signatures`', () => {
                describe('returns transactions with only signatures', () => {
                    it.todo('when maxSupportedTransactionVersion is set');
                    it.todo('when maxSupportedTransactionVersion is not set');
                    it.todo('when called without additional config');
                });
            });

            describe('when `transactionDetails` is set to `accounts`', () => {
                describe('returns transactions with only signatures and an annotated list of accounts', () => {
                    it.todo('when maxSupportedTransactionVersion is set');
                    it.todo('when maxSupportedTransactionVersion is not set');
                    it.todo('when called without additional config');
                });
            });

            describe('when `transactionDetails` is set to `full`', () => {
                describe('returns transactions with the correct shape', () => {
                    it.todo('when called with json encoding and maxSupportedTransactionVersion is set');
                    it.todo('when called with jsonParsed encoding and maxSupportedTransactionVersion is set');
                    it.todo('when called with base58 encoding and maxSupportedTransactionVersion is set');
                    it.todo('when called with base64 encoding and maxSupportedTransactionVersion is set');
                    it.todo('when called with json encoding and maxSupportedTransactionVersion is not set');
                    it.todo('when called with jsonParsed encoding and maxSupportedTransactionVersion is not set');
                    it.todo('when called with base58 encoding and maxSupportedTransactionVersion is not set');
                    it.todo('when called with base64 encoding and maxSupportedTransactionVersion is not set');
                    it.todo('when called without additional config');
                });
            });
        });
    });
});
