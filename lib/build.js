'use strict';

var babelGlobals = require('gulp-babel-globals');
var lazypipe = require('lazypipe');
var rename = require('gulp-rename');
var renameAlias = require('./renameAlias');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

function buildGlobalsNoSourceMaps(options) {
	var babelGlobalsOptions = {
		babel: {
			compact: false,
			resolveModuleSource: renameAlias,
			sourceMaps: true
		},
		bundleFileName: options.bundleFileName,
		globalName: options.globalName
	};
	return lazypipe()
		.pipe(function() {
			return babelGlobals(babelGlobalsOptions);
		});
}

function buildGlobals(options) {
	return lazypipe()
		.pipe(sourcemaps.init)
		.pipe(buildGlobalsNoSourceMaps(options))
		.pipe(sourcemaps.write, './');
}

function buildMinify() {
	return lazypipe()
		.pipe(rename, {
			suffix: '-min'
		})
		.pipe(uglify, {
			compress: {
				drop_console: true
			},
			preserveComments: 'some'
		});
}

module.exports.buildGlobals = buildGlobals;
module.exports.buildGlobalsNoSourceMaps = buildGlobalsNoSourceMaps;
module.exports.buildMinify = buildMinify;
