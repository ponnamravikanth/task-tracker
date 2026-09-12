import { defineConfig } from 'vite'

export default defineConfig({
  base: '/task-tracker/',

  server: {
    proxy: {
      '/task-tracker/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,

        rewrite: function (path) {
          return path.replace(/^\/task-tracker/, '')
        },
      },
    },
  },
})