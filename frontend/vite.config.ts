import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import fs from 'node:fs'

const backendPublicDir = path.resolve(__dirname, '../backend/public')

// No se puede usar build.emptyOutDir (borraría toda la carpeta, incluida `uploads/` con las
// fotos ya subidas por los usuarios). En vez de eso, antes de cada build solo se limpia
// `assets/`, que es donde caen los bundles con hash y donde si no se acumularían versiones viejas.
const cleanBackendAssets: Plugin = {
  name: 'clean-backend-public-assets',
  buildStart() {
    fs.rmSync(path.join(backendPublicDir, 'assets'), { recursive: true, force: true })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cleanBackendAssets],
  base: '/',
  build: {
    outDir: backendPublicDir,
    emptyOutDir: false,
  },
  server: {
    host: '0.0.0.0', // o true
    port: 5174,
    allowedHosts: ['sinul.es', 'www.sinul.es', 'kitchen.sinul.es'],
    hmr: {
      protocol: 'wss',
      clientPort: 443,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
