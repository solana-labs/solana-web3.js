import react from '@vitejs/plugin-react-swc';
import { defineConfig, Plugin } from 'vite';

function replaceProcessEnv(mode: string): Plugin {
    const nodeEnvRegex = /process(\.env(\.NODE_ENV)|\["env"\]\.NODE_ENV)/g;
    return {
        name: 'replace-process-env',
        renderChunk(code) {
            return code.replace(nodeEnvRegex, JSON.stringify(mode));
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    base: process.env.REACT_EXAMPLE_APP_BASE_PATH,
    define: {
        'process.env': process.env,
    },
    plugins: [react(), replaceProcessEnv(mode)],
}));
