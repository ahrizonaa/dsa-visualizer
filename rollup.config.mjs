import terser from '@rollup/plugin-terser';
import bundleSize from 'rollup-plugin-bundle-size';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
	input: 'build/popup.js',
	watch: true,
	output: {
		file: 'popup/popup.js',
		inlineDynamicImports: true,
		sourcemap: true
	},
	plugins: [
		typescript({ sourceMap: true }),
		terser(),
		bundleSize(),
		nodeResolve()
	]
};
