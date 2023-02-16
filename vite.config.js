import {defineConfig} from "vite";
import viteCompression from "vite-plugin-compression"

export default defineConfig({
    server: {
        port: 3000
    },
    plugins: [viteCompression()]
})