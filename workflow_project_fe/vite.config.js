import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      // '/api'로 시작하는 요청을 백엔드(Spring Boot) 서버로 전달
      '/api': {
        target: 'http://localhost:8006/workflow', // 백엔드 실행 포트에 맞게 수정 (예: 8080, 8000 등)
        changeOrigin: true,
        secure: false,
      },
    },
  },
})