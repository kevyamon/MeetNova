import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import versionInjector from './vite-plugin-version-injector.js';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    versionInjector()
  ]
})
