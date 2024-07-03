import { readFile } from 'fs/promises';
import jscodeshift from 'jscodeshift';
import { Options } from 'tsup';

type Loader = NonNullable<
    NonNullable<Awaited<NonNullable<ReturnType<Parameters<Parameters<Plugin['setup']>[0]['onLoad']>[1]>>>>['loader']
>;
type Plugin = NonNullable<Options['esbuildPlugins']>[number];

function replaceDev(source: string): string {
    if (/__DEV__/.test(source) !== true) {
        return source;
    }
    const j = jscodeshift.withParser('tsx');
    const root = j(source);
    root.find(j.Identifier, { name: '__DEV__' }).replaceWith(() =>
        j.binaryExpression(
            '!==',
            j.memberExpression(
                j.memberExpression(j.identifier('process'), j.identifier('env')),
                j.identifier('NODE_ENV'),
            ),
            j.stringLiteral('production'),
        ),
    );
    return root.toSource();
}

export const DevFlagPlugin: Plugin = {
    name: 'dev-flag-plugin',
    setup(build) {
        build.onLoad({ filter: /\.(t|j)sx?$/, namespace: 'file' }, async ({ path }) => {
            const contents = await readFile(path, 'utf-8');
            const ext = path.slice(path.lastIndexOf('.') + 1);
            const loader = (ext.match(/(j|t)sx?$/) ? ext : 'js') as Loader;
            return {
                contents: replaceDev(contents),
                loader,
            };
        });
    },
};
