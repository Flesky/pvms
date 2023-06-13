import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import VueRouter from 'unplugin-vue-router/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({
      dts: 'types/typed-router.d.ts',
    }),
    vue({
      script: {
        defineModel: true,
      },
    }),
    vueJsx(),
    Components({
      dirs: ['src/components', 'src/modules'],
      directoryAsNamespace: true,
      collapseSamePrefixes: true,
      resolvers: [
        NaiveUiResolver(),
        IconsResolver({
          prefix: false,
          alias: {
            i: 'tabler',
          },
        }),
      ],
      dts: 'types/components.d.ts',
    }),
    AutoImport({
      imports: [
        'vue',
        'pinia',
        '@vueuse/head',
        '@vueuse/core',
        VueRouterAutoImports,
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar',
          ],
          'axios': [
            ['default', 'axios'],
          ],
          'dayjs': [
            ['default', 'dayjs'],
          ],
          'vue-request': [
            'useRequest',
          ],
        },
      ],
      vueTemplate: true,
      dts: 'types/auto-imports.d.ts',
    }),
    Icons({}),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
