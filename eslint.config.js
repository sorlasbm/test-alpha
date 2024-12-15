import * as wdioPlugin from "eslint-plugin-wdio";
import prettierConfig from "eslint-config-prettier";

export default [
    {
        files: ["*.js", "*.cjs", "*.mjs"],
        ignores: ["node_modules/", "allure-report/", "allure-results/"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                browser: true,
                $: true,
                $$: true,
            },
        },
        plugins: {
            wdio: wdioPlugin,
        },
        rules: {
            ...wdioPlugin.configs.recommended.rules,
            ...prettierConfig.rules,
        }
    },
    {
        files: ["*.test.js", "*.spec.js"],
        rules: {
            "mocha/no-exclusive-tests": "error",
            "mocha/no-skipped-tests": "warn",
        },
    },
];