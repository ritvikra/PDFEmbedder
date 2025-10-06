import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    define: {
      'import.meta.env.ENV': JSON.stringify(process.env.ENV),
      'import.meta.env.VM_IP_ADDRESS': JSON.stringify(process.env.VM_IP_ADDRESS),
    },
    server: {
      port: 3001,
      host: process.env.ENV === 'remote' ? '0.0.0.0' : 'localhost',
    }
  }
})
