import mridang from '@mridang/eslint-defaults';

export default [
  {
    ignores: ['docs/**', 'dist/**', 'build/**', '.out/**', 'playground/**'],
  },
  ...mridang.configs.recommended,
  {
    // This is a Vue library, not a React one. The shared defaults bundle
    // React-specific rules that misfire on Vue's `setup()` (e.g. flagging
    // `useAuth`/`useReducer`/`useRouter` as React Hooks). They do not apply
    // to this codebase, so disable them project-wide.
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
];
