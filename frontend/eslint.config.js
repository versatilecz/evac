import eslint from '@eslint/js'
import prettierConfig from '@vue/eslint-config-prettier'
import { defineConfig } from 'eslint/config'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default defineConfig([
  { ignores: ['*.d.ts', '**/coverage', '**/dist'] },
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  {
    ignores: [
      '**/node_modules/*',
      '**/.nx/*',
      '**/.vite/*',
      '**/coverage/*',
      '**/dist/*',
      '**/out/*',
      '**/vite.config.js.timestamp-*.js',
    ],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['*.{ts,vue}', '**/*.{ts,vue}'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...vue.configs['flat/recommended']],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-prop-types': 'off',
    },
  },
  {
    ...prettierConfig,
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'off',
    },
  },
])
