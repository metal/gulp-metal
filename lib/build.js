'use strict';

var babelGlobals = require('gulp-babel-globals');
var lazypipe = require('lazypipe');
var renameAlias = require('./renameAlias');
var sourcemaps = require('gulp-sourcemaps');

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

module.exports.buildGlobals = buildGlobals;
module.exports.buildGlobalsNoSourceMaps = buildGlobalsNoSourceMaps;
