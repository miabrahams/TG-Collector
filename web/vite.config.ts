import { AliasOptions, defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

import path from "path";
const root = path.resolve(__dirname, "src");


// https://vite.dev/config/
export default defineConfig({
  plugins: [solid(), tailwindcss()],
  resolve: {
    alias: {
      "@": root,
      "@auth": path.join(root, "features/auth"),
      "@gallery": path.join(root, "features/gallery"),
      "@preferences": path.join(root, "features/preferences"),
      "@navigation": path.join(root, "features/navigation"),
      "@media": path.join(root, "features/media"),
      "@shared": path.join(root, "shared"),
    } as AliasOptions,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/static': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/thumbnail': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  },
})
