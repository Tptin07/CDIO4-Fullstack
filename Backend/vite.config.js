import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        'hang-moi': './hang-moi.html',
        'ban-chay': './ban-chay.html',
      },
    },
  },
})
