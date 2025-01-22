import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})

/** @type {import("@eslint/eslintrc").FlatConfig[]} */
const eslintConfig = [
  ...compat.config({
    // extends: ['next/core-web-vitals'],
    // rules: {
    //   '@next/next/no-html-link-for-pages': 'off',
    // }
  }),
]
export default eslintConfig