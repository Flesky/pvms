import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

export default antfu({
  react: true,
}, ...compat.config({
  extends: ['plugin:tailwindcss/recommended', 'plugin:@tanstack/eslint-plugin-query/recommended'],
  rules: {
    'perfectionist/sort-interfaces': ['error', {
      type: 'natural',
      order: 'asc',
    }],
    'tailwindcss/no-custom-classname': 'off',
    'tailwindcss/migration-from-tailwind-2': 'off',
  },
}))
