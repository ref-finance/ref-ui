module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      // Allows for the parsing of JSX
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    '.DS_Store',
    '.idea/',
    '.vscode/',
    'package-lock.json',
    'yarn.lock',
    'node_modules',
  ],
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  plugins: ['simple-import-sort', 'unused-imports'],
  rules: {
    'unused-imports/no-unused-imports': 'off',
    'simple-import-sort/imports': 'off',
    'simple-import-sort/exports': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'prettier/prettier': ['warn', { endOfLine: 'auto' }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'react/react-in-jsx-scope': 'off',
    'object-shorthand': ['error', 'always'],
    'dot-notation': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/ban-types': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
};
