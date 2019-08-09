import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import babel from "rollup-plugin-babel";
import postcss from "rollup-plugin-postcss";

import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

const outputPath = "public";
const outputBundles = `${outputPath}/dist`;


const browserConfig = {
    input: "src/main.js",
    output: {
        sourcemap: !production,
        format: "amd",
        name: "app",
        dir: outputBundles,
    },
    plugins: [
        postcss({
            extensions: [".css", ".styl"],
            extract: `${outputBundles}/bundle.global.css`,
        }),
        svelte({
            dev: !production,
            css: css => {
                const out = `${outputBundles}/bundle.css`;
                css.write(out, !production);
            },
        }),
        resolve({
            browser: true,
        }),
        commonjs(),
        babel({
            exclude: "node_modules/**",
        }),
        !production &&
        livereload({
            watch: outputPath,
            port: 35729,
        }),
        production && terser()
    ],
    watch: {
        clearScreen: false,
    },
};


export default browserConfig;