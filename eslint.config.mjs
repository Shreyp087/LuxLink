import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/.turbo/**',
      '**/coverage/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports', prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },
  {
    ...tseslint.configs.disableTypeChecked,
    files: [
      '**/*.config.{ts,mts,cts}',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/e2e/**/*.{ts,tsx}',
    ],
  },
  {
    ...tseslint.configs.disableTypeChecked,
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier,
);
