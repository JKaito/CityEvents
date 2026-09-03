import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative asset URLs, so the built site works from any path — including
  // GitHub Pages, which serves a project site from /<repo>/ rather than /.
  base: './',
  plugins: [react()],
})
