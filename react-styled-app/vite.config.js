import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // CommonJS 호환성을 위한 설정 (필요한 경우에만 주석 해제)
  // optimizeDeps: {
  //   include: ['react-canvas-draw']
  // },
  // build: {
  //   commonjsOptions: {
  //     include: [/react-canvas-draw/, /node_modules/]
  //   }
  // }
})
