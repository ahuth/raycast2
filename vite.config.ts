import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        // Used by the output of asc for Node targets. Won't run in the browser, so we can just
        // mark it as external.
        'node:fs/promises',
      ],
    },
  },
})
