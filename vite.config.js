import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/shop-acc/', // Thêm dòng này (trùng với tên kho code trên GitHub của bạn)
  plugins: [react()],
})
