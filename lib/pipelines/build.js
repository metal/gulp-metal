'use strict';

var babelGlobals = require('gulp-babel-globals');
var combiner = require('stream-combiner');
var rename = require('gulp-rename');
var renameAlias = require('../renameAlias');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

function buildGlobalsNoSourceMaps(options) {
	return babelGlobals({
		babel: {
			compact: false,
			resolveModuleSource: renameAlias,
			sourceMaps: true
		},
		bundleFileName: options.bundleFileName,
		globalName: options.globalName
	});
}

function buildGlobals(options) {
	return combiner(
		sourcemaps.init(),
		buildGlobalsNoSourceMaps(options),
		sourcemaps.write('./')
	);
}

function buildMinify() {
	return combiner(
		rename({
			suffix: '-min'
		}),
		uglify({
			compress: {
				drop_console: true
			},
			preserveComments: 'some'
		})
	);
}

module.exports.buildGlobals = buildGlobals;
module.exports.buildGlobalsNoSourceMaps = buildGlobalsNoSourceMaps;
module.exports.buildMinify = buildMinify;
