import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(), // 👈 this wires Tailwind into Vite
    ],
    // In dev, forward /api to the local backend (in the cluster, the ingress does this)
    server: {
        proxy: {
            "/api": "http://localhost:5171",
        },
    },
});
