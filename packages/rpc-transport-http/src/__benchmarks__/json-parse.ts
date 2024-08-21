#!/usr/bin/env -S pnpm dlx tsx --

import { Bench } from 'tinybench';
import { fs, path } from 'zx';

import {
    jsonParseWithLargeIntegersAsBigInts,
    wrapLargeIntegersUsingParser,
    wrapLargeIntegersUsingParserAndRegex,
    wrapLargeIntegersUsingRegex,
} from '../json-parse-with-bigint';

Object.assign(globalThis, {
    __BROWSER__: false,
    __DEV__: false,
    __NODEJS__: true,
    __REACTNATIVE____: false,
});

const bench = new Bench({
    throws: true,
});

const largeJsonPath = path.join(__dirname, '..', '__tests__', 'large-json-file.json');
const largeJsonString = fs.readFileSync(largeJsonPath, 'utf8');

bench
    .add('JSON.parse', () => {
        return JSON.parse(largeJsonString);
    })
    .add('JSON.parse with noop pre-processing loop', () => {
        const out = [];
        for (let ii = 0; ii < largeJsonString.length; ii++) {
            out.push(largeJsonString[ii]);
        }
        return JSON.parse(out.join(''));
    })
    .add('JSON.parse with noop reviver', () => {
        return jsonParseWithLargeIntegersAsBigInts(largeJsonString, x => x);
    })
    .add('jsonParseWithLargeIntegersAsBigInts (parser)', () => {
        return jsonParseWithLargeIntegersAsBigInts(largeJsonString);
    })
    .add('jsonParseWithLargeIntegersAsBigInts (parser and regex)', () => {
        return jsonParseWithLargeIntegersAsBigInts(largeJsonString, wrapLargeIntegersUsingParserAndRegex);
    })
    .add('jsonParseWithLargeIntegersAsBigInts (parser and noop)', () => {
        return jsonParseWithLargeIntegersAsBigInts(largeJsonString, x => wrapLargeIntegersUsingParser(x, () => null));
    })
    .add('jsonParseWithLargeIntegersAsBigInts (regex)', () => {
        return jsonParseWithLargeIntegersAsBigInts(largeJsonString, wrapLargeIntegersUsingRegex);
    });

(async () => {
    await bench.run();
    console.table(bench.table());
})();
