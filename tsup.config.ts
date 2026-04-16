import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ["lib/core-abi.ts"],
    publicDir: "lib",
    format: ["cjs", "esm"],
    shims: true,
    minify: false,
    sourcemap: false,
    clean: true,
    experimentalDts: "lib/core-abi.ts"
})
