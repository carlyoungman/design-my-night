import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import crypto from 'crypto'

function wordpressAssetPlugin(): Plugin {
  return {
    name: 'wordpress-asset-php',
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry) {
          const hash = crypto.createHash('md5').update(chunk.code).digest('hex').slice(0, 8)
          this.emitFile({
            type: 'asset',
            fileName: 'index.asset.php',
            source: `<?php return array('dependencies' => array(), 'version' => '${hash}');`,
          })
          break
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), wordpressAssetPlugin()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/admin/index.tsx'),
      formats: ['iife'],
      name: 'DmnAdmin',
    },
    outDir: 'dist/admin',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith('.css') ? 'index.css' : '[name][extname]',
      },
    },
  },
  resolve: {
    alias: {
      '@admin': path.resolve(__dirname, 'src/admin'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
    },
  },
})
