import { createPrompt, useKeypress, usePrefix } from '@inquirer/core';
import colors from 'yoctocolors';

export default createPrompt<void, string>((message = 'Press any key to exit', done) => {
    const prefix = usePrefix({});
    if (process.env.CI) {
        done();
    } else {
        useKeypress(() => {
            done();
        });
    }
    return `${prefix} ${colors.bold(message)}`;
});
