import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/**/*.ts', '!src/**/*.d.ts', 'src/**/*.tsx', '!src/**/*.test.ts*'],
	skipNodeModulesBundle: true,
	format: ['esm'],
	tsconfig: 'tsconfig.json'
});
