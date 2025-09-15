import js from "@eslint/js";
import prettierConfig from "@vue/eslint-config-prettier";
import { defineConfig } from "eslint/config";
import vue from "eslint-plugin-vue";
import globals from "globals";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  {
    ignores: [
      "**/node_modules/*",
      "**/.nx/*",
      "**/.vite/*",
      "**/coverage/*",
      "**/dist/*",
      "**/out/*",
      "**/vite.config.js.timestamp-*.js",
    ],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  js.configs.recommended,
  vue.configs["flat/recommended"],
  {
    files: ["*.vue", "**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "vue/require-prop-types": "off",
    },
  },
  {
    ...prettierConfig,
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "off",
    },
  },
]);
