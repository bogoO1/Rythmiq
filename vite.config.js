import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/Rythmiq/", // Ensure this matches your deployment path
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  assetsInclude: ["**/*.frag", "**/*.vert", "**/*.mp3"], // Include shader files
});
