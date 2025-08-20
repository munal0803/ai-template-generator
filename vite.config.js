import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
plugins: [react()],
// For GitHub Project Pages: https://USERNAME.github.io/REPO/
base: '/AI-Template-generator/', // ← replace with your repo name. For User Pages, use '/'
})