import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  target: "node24",
  platform: "node",
  clean: true, // delete old /dist folder before building
  dts: true,
  sourcemap: true, // when error occur we will see the original source code instead of the bundled code
  splitting: false,
  minify: false,
});
