import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Thêm dòng này (trùng với tên kho code trên GitHub của bạn)
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'vendor-supabase', test: /node_modules[\\/]@supabase[\\/]/ },
            { name: 'vendor-lucide', test: /node_modules[\\/]lucide-react[\\/]/ },
            { name: 'vendor-emailjs', test: /node_modules[\\/]@emailjs[\\/]/ },
          ],
        },
      },
    },
  },
})
