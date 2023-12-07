import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Target es2022 so we can use top-level await, which asc outputs as part of the wasm/js
    // integration file. Alternatively, we could use Vite to load the .wasm file and provide
    // the interop ourselves.
    target: 'es2022',
    rollupOptions: {
      external: [
        // Used by the output of asc for Node targets. Won't run in the browser, so we can just
        // mark it as external.
        'node:fs/promises',
      ],
    },
  },
})
