import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'info',       // اطبع جميع الرسائل وليس فقط الأخطاء
  clearScreen: false,     // منع Vite من مسح الكونسول
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    open: true,           // يفتح المتصفح تلقائيًا عند تشغيل npm run dev
    port: 5173,           // يمكنك تغييره إذا أردت
  },
})
