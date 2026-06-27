import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: true,
	// Node builtins are auto-externalized by tsup; keep vite out of the bundle.
	external: ["vite"],
	treeshake: true,
});
