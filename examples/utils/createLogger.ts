import process from 'node:process';

import { DestinationStream, Logger, pino } from 'pino';
import { build } from 'pino-pretty';

const BASE_OPTIONS = {
    colorize: true,
    colorizeObjects: true,
    sync: true,
} as const;

const prettyStream = build({
    ...BASE_OPTIONS,
    ignore: 'hostname,pid,time',
});
const prettyStreamWithTimestamp = build({
    ...BASE_OPTIONS,
    ignore: 'hostname,pid',
});

let fatalLoggerInstalled = false;
function ensureFatalLogger(logger: Logger<never>) {
    if (fatalLoggerInstalled) {
        return;
    }
    fatalLoggerInstalled = true;
    process.on('uncaughtException', err => {
        logger.fatal(err);
        process.exit(1);
    });
}

function createLoggerWithName(name: string, stream: DestinationStream) {
    return pino(
        {
            level: 'debug',
            name,
        },
        stream,
    );
}

export function createLogger(name: string) {
    const logger = createLoggerWithName(name, prettyStream);
    ensureFatalLogger(logger);
    return logger;
}

export function createLoggerWithTimestamp(name: string) {
    const logger = createLoggerWithName(name, prettyStreamWithTimestamp);
    ensureFatalLogger(logger);
    return logger;
}
