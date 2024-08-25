import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "^/api/.*": "http://localhost:5261",
      "^/api/timerbattle/signalr": {
        ws: true,
        target: "ws://localhost:5261"
      },
    },
  },
})
