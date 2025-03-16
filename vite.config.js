import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/Rythmiq/", // Make sure this matches the GitHub repo name
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  assetsInclude: ["**/*.frag", "**/*.vert", "**/*.mp3"], // Tells Vite to include shader files
});
