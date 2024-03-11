import { FlatCompat } from '@eslint/eslintrc'
import antfu from '@antfu/eslint-config'

const compat = new FlatCompat()

export default antfu({
  react: true,
  rules: {
    'tailwindcss/migration-from-tailwind-2': 'off',
    'tailwindcss/no-custom-classname': 'off',
  },
}, ...compat.config({
  extends: ['plugin:tailwindcss/recommended', 'plugin:@tanstack/eslint-plugin-query/recommended'],
  rules: {
  },
}))
