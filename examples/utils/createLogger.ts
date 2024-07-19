import process from 'node:process';

import { Logger, pino } from 'pino';
import { build } from 'pino-pretty';

const prettyStream = build({
    colorize: true,
    colorizeObjects: true,
    ignore: 'hostname,pid,time',
    sync: true,
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

function createLoggerWithName(name: string) {
    return pino(
        {
            level: 'debug',
            name,
        },
        prettyStream,
    );
}

export default function createLogger(name: string) {
    const logger = createLoggerWithName(name);
    ensureFatalLogger(logger);
    return logger;
}
