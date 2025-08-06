import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ViteImageOptimize from 'vite-plugin-imagemin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    ViteImageOptimize({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false
      },
      optipng: {
        optimizationLevel: 7
      },
      mozjpeg: {
        quality: 60,
        progressive: true,
        smooth: 1
      },
      webp: {
        quality: 75,
        method: 6
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox'
          },
          {
            name: 'removeEmptyAttrs',
            active: false
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      src: "/src",
      features: "/src/features",
      config: "/src/config",
      lib: "/src/lib",
      routes: "/src/routes",
      pages: "/src/pages",
      components: "/src/components",
      utils: "/src/utils",
      providers: "/src/providers",
      assets: "/src/assets",
      "test-utils": "/src/test/test-utils",
      "@features": "/src/features",
      "hooks": "/src/hooks",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'maps': ['mapbox-gl'],
          'utils': ['lodash', 'dayjs', 'axios'],
          'router': ['react-router-dom'],
          'query': ['@tanstack/react-query'],
        }
      }
    }
  }
})

