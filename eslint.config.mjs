import nextConfig from 'eslint-config-next';
import nextTsConfig from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  // Global ignore patterns
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'misc/**'],
  },

  // Apply Next.js and TypeScript recommended configurations
  ...nextConfig,
  ...nextTsConfig,

  // Custom project rules
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@next/next/no-page-custom-font': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },

  // File-specific overrides for type definitions
  {
    files: ['types/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Prettier config to disable conflicting formatting rules (must come last)
  prettierConfig,
];

export default eslintConfig;
