module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
        browser: true
    },
    plugins: [
        "prettier",
        "svelte3"
    ],
    globals: {
        isClientSide: true,
        ENV: true
    },
    parser: "babel-eslint",
    parserOptions: {
        sourceType: "module",
        ecmaVersion: 2019,
        ecmaFeatures: {
            jsx: true,
            modules: true,
            experimentalObjectRestSpread: true
        }
    },
    extends: [
        // "prettier",
        "eslint:recommended"
    ],
    rules: {
        // "prettier/prettier": "error",
        camelcase: "off",
        // indent: ["error", 4],
        'a11y-missing-content': 'off',
        quotes: ["error", "double"],
        semi: ["error", "always"]
    }
};