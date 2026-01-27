import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
  preview: {
    host: true,
    port: Number(process.env.PORT) || 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Разделение vendor библиотек
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'store': ['zustand'],
        },
      },
    },
    // Оптимизация размера
    chunkSizeWarningLimit: 1000,
    // Source maps для отладки (можно отключить после исправления всех ошибок)
    sourcemap: true,
    // Минификация с сохранением имен для лучшей отладки
    minify: 'terser',
    terserOptions: ({
      compress: {
        drop_console: false, // Оставляем console для отладки
      },
      format: {
        comments: false,
      },
    } as any),
  },
  // Оптимизация зависимостей
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
  },
});
