import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const baseIgnores = {
  ignores: [
    'node_modules/**',
    '.git/**',
    'artifacts/**',
    'playwright-report/**',
    'test-results/**',
    '.husky/_/**',
    '.agents/**',
    '*.html',
    'package-lock.json',
    'index.html',
    'dist/**',
    'build/**',
    'coverage/**',
  ],
};

const jsConfig = {
  files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
  plugins: { js },
  languageOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    globals: { ...globals.node, ...globals.browser },
  },
  rules: {
    ...js.configs.recommended.rules,
    complexity: ['warn', 15],
    'max-lines': ['warn', 500],
    'max-lines-per-function': ['warn', 150],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
    'no-console': 'off',
  },
};

const apiTsConfig = {
  files: ['api/**/*.ts'],
  plugins: { '@typescript-eslint': tseslint },
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: './api/tsconfig.json',
      tsconfigRootDir: process.cwd(),
    },
    globals: globals.node,
  },
  rules: {
    ...tseslint.configs.recommended.rules,
    complexity: ['warn', 15],
    'max-lines': ['warn', 500],
    'max-lines-per-function': ['warn', 150],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'function',
        format: ['camelCase'],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
    ],
  },
};

const testsTsConfig = {
  files: ['tests/**/*.ts', 'vitest.config.ts'],
  plugins: { '@typescript-eslint': tseslint },
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: process.cwd(),
    },
    globals: globals.node,
  },
  rules: {
    ...tseslint.configs.recommended.rules,
    complexity: ['warn', 15],
    'max-lines': ['warn', 500],
    'max-lines-per-function': ['warn', 150],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'function',
        format: ['camelCase'],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
    ],
  },
};

export default [baseIgnores, jsConfig, apiTsConfig, testsTsConfig];
