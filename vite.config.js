import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import authPlugin from './server/authPlugin.js'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Empty prefix loads every .env var (not just VITE_*) — server-side only, never sent to the browser.
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  // The auth API only runs in the dev/preview server, so a plain build needs no credentials.
  return { plugins: [react(), command === 'serve' ? authPlugin(env) : null] }
})
