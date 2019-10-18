'use strict';
/* eslint-disable @typescript-eslint/no-var-requires */
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function(env, argv) {
	env = env || {};
	env.analyzeBundle = Boolean(env.analyzeBundle);
	env.analyzeDeps = Boolean(env.analyzeDeps);
	env.production = env.analyzeBundle || Boolean(env.production);

	/**
	 * @type any[]
	 */
	const plugins = [
		new CleanPlugin({ cleanOnceBeforeBuildPatterns: ['**/*'] }),
		new ForkTsCheckerPlugin({
			async: false,
			eslint: true
		})
	];

	if (env.analyzeDeps) {
		plugins.push(
			new CircularDependencyPlugin({
				cwd: __dirname,
				exclude: /node_modules/,
				failOnError: false,
				onDetected: function({ module: webpackModuleRecord, paths, compilation }) {
					if (paths.some(p => p.includes('container.ts'))) return;

					compilation.warnings.push(new Error(paths.join(' -> ')));
				}
			})
		);
	}

	if (env.analyzeBundle) {
		plugins.push(new BundleAnalyzerPlugin());
	}

	return {
		name: 'extension',
		entry: './src/extension.ts',
		mode: env.production ? 'production' : 'development',
		target: 'node',
		node: {
			__dirname: false
		},
		devtool: 'source-map',
		output: {
			libraryTarget: 'commonjs2',
			filename: 'extension.js'
		},
		optimization: {
			minimizer: [
				new TerserPlugin({
					cache: true,
					parallel: true,
					sourceMap: env.production,
					terserOptions: {
						ecma: 8,
						// Keep the class names otherwise @log won't provide a useful name
						// eslint-disable-next-line @typescript-eslint/camelcase
						keep_classnames: true,
						module: true
					}
				})
			]
		},
		externals: {
			vscode: 'commonjs vscode'
		},
		module: {
			rules: [
				{
					exclude: /node_modules|\.d\.ts$/,
					test: /\.tsx?$/,
					use: {
						loader: 'ts-loader',
						options: {
							experimentalWatchApi: true,
							transpileOnly: true
						}
					}
				}
			]
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
		},
		plugins: plugins,
		stats: {
			all: false,
			assets: true,
			builtAt: true,
			env: true,
			errors: true,
			timings: true,
			warnings: true
		}
	};
};
