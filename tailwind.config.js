/** @type {import('tailwindcss').Config} */

export default {
	content: [
		'./build/**/*.{html,js}',
		'./popup/**/*.html',
		'./node_modules/tw-elements/dist/js/*.js'
	],
	theme: {
		extend: {}
	},
	plugins: [require('tw-elements/dist/plugin.cjs')],
	darkMode: 'class'
};
