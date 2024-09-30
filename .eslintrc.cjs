module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    "no-restricted-imports": [
      "error",
      {
        "patterns": ["@mui/*/*/*"]
      }
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_[^_].*$|^_$",
        "varsIgnorePattern": "^_[^_].*$|^_$",
        "caughtErrorsIgnorePattern": "^_[^_].*$|^_$"
      }
    ],
    "@typescript-eslint/no-explicit-any": "off"
  },
}
