/* eslint-disable */
const { teardown } = require('jest-dev-server');

module.exports = async function globalTeardown() {
    await teardown(globalThis.servers);
};
