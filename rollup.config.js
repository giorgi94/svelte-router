import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import replace from "rollup-plugin-replace";
import babel from "rollup-plugin-babel";

import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

const ENV = production ? "production" : "development";

const browserConfig = {
    input: "src/index.js",
    output: {
        sourcemap: !production,
        format: "cjs",
        file: "dist/svelte-router.js",
    },
    plugins: [
        replace({
            isClientSide: JSON.stringify(true),
            ENV: JSON.stringify(ENV),
        }),
        svelte({
            dev: !production
        }),
        resolve({
            browser: true,
        }),
        commonjs(),
        babel({
            exclude: "node_modules/**",
        }),
        production && terser()
    ],
    watch: {
        clearScreen: false,
    },
};

const serverConfig = {
    input: "src/index.js",
    output: {
        sourcemap: false,
        format: "cjs",
        file: "dist/svelte-router.ssr.js",
    },
    plugins: [
        replace({
            isClientSide: JSON.stringify(false),
            ENV: JSON.stringify(ENV)
        }),
        svelte({
            generate: "ssr"
        }),
        resolve(),
        commonjs(),
        production && terser()
    ]
};


export default [browserConfig, serverConfig];