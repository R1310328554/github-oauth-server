import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    extensions: ['.vue', '.js', '.json', '.mjs']
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    open: false,
    proxy: {
      '/v1': {
        target: 'http://127.0.0.1:8999',
        changeOrigin: true
      }
    }
  },
  base: './'
})
