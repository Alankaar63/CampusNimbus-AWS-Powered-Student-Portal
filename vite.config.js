import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const configuredBaseUrl =
    env.VITE_API_BASE_URL ||
    'https://x48mm0l3zi.execute-api.ap-south-1.amazonaws.com/prod'

  let proxyTarget = configuredBaseUrl
  let proxyBasePath = ''

  try {
    const url = new URL(configuredBaseUrl)
    proxyTarget = `${url.protocol}//${url.host}`
    proxyBasePath = url.pathname.replace(/\/$/, '')
  } catch {
    proxyTarget = configuredBaseUrl
    proxyBasePath = ''
  }

  return {
    plugins: [react()],
    base: "/",
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            const suffix = path.replace(/^\/api/, '')
            return `${proxyBasePath}${suffix}`
          },
        },
      },
    },
  }
})
