import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import sveltePreprocess from 'svelte-preprocess';
import alias from '@rollup/plugin-alias';
import ignoreImport from 'rollup-plugin-ignore-import';

const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'src/frontend/main.js',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'app',
        file: 'public/build/bundle.js',
    },
    plugins: [
        svelte({
            preprocess: sveltePreprocess({ postcss: true }),
            compilerOptions: {
                dev: !production,
            },
        }),
        postcss({
            extract: 'bundle.css',
            minimize: production,
            use: [
                [
                    'sass',
                    {
                        includePaths: ['./src/theme', './node_modules'],
                    },
                ],
            ],
        }),
        resolve({
            browser: true,
            dedupe: ['svelte'],
        }),
        alias({
            entries: [{ find: /\.json$/, replacement: 'empty-module' }],
        }),
        ignoreImport({
            extensions: ['.json'],
        }),
        commonjs(),
        production && terser(),
    ],
    watch: {
        clearScreen: false,
        include: ['src/frontend/**'],
        exclude: ['node_modules/**', 'src/data/**'],
    },
};
