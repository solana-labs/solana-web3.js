/* eslint-disable */
const { setup } = require('jest-dev-server');

module.exports = async function globalSetup() {
    globalThis.servers = await setup([
        // Unconditionally obtain a lease on the test validator.
        { command: '../../scripts/start-shared-test-validator.sh' },
        // This 'server' is a noop; we only use it to run the 'wait for server' logic.
        {
            command: 'while true; do sleep 86400000; done',
            host: '127.0.0.1',
            launchTimeout: 50000,
            path: 'health',
            port: 8899,
            protocol: 'http',
            usedPortAction: 'ignore',
        },
    ]);
};
