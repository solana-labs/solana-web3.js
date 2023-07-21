/* eslint-disable */
const { setup } = require('jest-dev-server');
const waitOn = require('wait-on');

module.exports = async function globalSetup() {
    console.info('Starting test validator');
    globalThis.servers = await setup({
        command: '../../scripts/start-shared-test-validator.sh',
    });
    console.info('Waiting for test validator to form first root (~13 seconds)');
    await waitOn({
        resources: [
            '/tmp/lock/.solanatestvalidator.ready',
        ],
    });
};
