/* eslint-disable */
const { setup } = require('jest-dev-server');

module.exports = async function globalSetup() {
    globalThis.servers = await setup({
        command: '../../scripts/start-shared-test-validator.sh',
        host: '127.0.0.1',
        launchTimeout: 50000,
        path: 'health',
        port: 8899,
        protocol: 'http',
    });
};
