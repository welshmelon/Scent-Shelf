// FILE 5: vite.config.js
// This is a configuration file for the build tool.
// Create this file in the main directory of your repository.
// Name the file vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
```