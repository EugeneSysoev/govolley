import js from '@eslint/js';
import ts from 'typescript-eslint';
import next from '@next/eslint-plugin-next';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
export default ts.config(
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'coverage/**'] },
  { languageOptions: { globals: globals.node } },
  js.configs.recommended, ...ts.configs.recommended,
  { files: ['**/*.{ts,tsx}'], languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.jest } },
    plugins: { '@next/next': next, 'react-hooks': hooks },
    rules: { ...next.configs.recommended.rules, ...next.configs['core-web-vitals'].rules,
      'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'warn' } },
);
