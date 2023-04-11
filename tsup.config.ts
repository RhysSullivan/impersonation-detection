import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/**/*.ts', '!src/**/*.d.ts', 'src/**/*.tsx', '!src/**/*.test.ts*'],
	skipNodeModulesBundle: true,
	format: ['esm'],
	tsconfig: 'tsconfig.json',
	clean: true,
	dts: true,
	minify: false,
	sourcemap: true,
	target: 'es2020',
	keepNames: true,
	treeshake: true,
	bundle: true,
	splitting: false
});
