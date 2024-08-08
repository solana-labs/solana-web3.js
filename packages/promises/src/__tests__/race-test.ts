/**
 * Forked from https://github.com/digitalloggers/race-as-promised/tree/master
 *
 * Authored by Brian Kim:
 * https://github.com/nodejs/node/issues/17469#issuecomment-685216777
 *
 * Adapted to module structure.
 *
 * Adjusted to run for a finite time and perform explicit leak checks.
 */

import { safeRace } from '../race';

async function randomString(length: number) {
    await new Promise(resolve => setTimeout(resolve, 1));
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const iterationCount = 1000;
const stringSize = 10000;

function usageMeaningfullyIncreasing(usages: readonly NodeJS.MemoryUsage[], key: 'heapUsed' | 'rss') {
    return (
        usages[2][key] - usages[0][key] > 2 * iterationCount * stringSize &&
        usages[2][key] - usages[1][key] > (usages[1][key] - usages[0][key]) / 2
    );
}

function detectLeak(usages: readonly NodeJS.MemoryUsage[]) {
    return usageMeaningfullyIncreasing(usages, 'rss') || usageMeaningfullyIncreasing(usages, 'heapUsed');
}

async function run(race: typeof Promise.race) {
    const pending = new Promise(() => {});
    for (let i = 0; i < iterationCount; i++) {
        // We use random strings to prevent string interning.
        // Pass a different length string to see effects on memory usage.
        await race([pending, randomString(stringSize)]);
    }
}

describe('Promise.race', () => {
    let nativeRace: typeof Promise.race;
    beforeEach(() => {
        nativeRace = Promise.race.bind(Promise);
    });
    // FIXME(#3081): This test times out in CI
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('leaks memory', async () => {
        expect.assertions(1);
        const usages = [];
        usages.push(process.memoryUsage());
        await run(nativeRace);
        usages.push(process.memoryUsage());
        await run(nativeRace);
        usages.push(process.memoryUsage());
        expect(detectLeak(usages)).toBe(true);
    }, 60_000 /* timeout */);
});

describe('safeRace', () => {
    // FIXME(#3081): This test times out in CI
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('does not leak memory', async () => {
        expect.assertions(1);
        const usages = [];
        usages.push(process.memoryUsage());
        await run(safeRace);
        usages.push(process.memoryUsage());
        await run(safeRace);
        usages.push(process.memoryUsage());
        expect(detectLeak(usages)).toBe(false);
    }, 60_000 /* timeout */);
});
