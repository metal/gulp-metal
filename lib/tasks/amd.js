'use strict';

var babelDeps = require('gulp-babel-deps');
var build = require('../pipelines/build');
var combiner = require('stream-combiner');
var getBowerDir = require('../getBowerDir');
var gulp = require('gulp');
var normalizeOptions = require('../options');
var path = require('path');
var renameAlias = require('../renameAlias');
var sourcemaps = require('gulp-sourcemaps');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'build:amd', [taskPrefix + 'soy'], function() {
		return gulp.src(options.buildSrc, {base: process.cwd()})
			.pipe(buildAmd(options))
			.pipe(destAmd(options, options.buildAmdDest));
	});

	gulp.task(taskPrefix + 'build:amd:jquery', [taskPrefix + 'soy'], function() {
		return gulp.src(options.buildSrc, {base: process.cwd()})
			.pipe(build.addJQueryAdapterRegistration())
			.pipe(buildAmd(options))
			.pipe(destAmd(options, options.buildAmdJqueryDest));
	});
};

function buildAmd(options) {
	return combiner(
		sourcemaps.init(),
		buildAmdNoSourceMaps(options),
		sourcemaps.write('./')
	);
}

function buildAmdNoSourceMaps(options) {
	return babelDeps({
		babel: {
			compact: false,
			modules: 'amd',
			resolveModuleSource: function(source, filename) {
				return getAmdModuleId(renameWithoutJsExt(source, filename), options.moduleName);
			},
			sourceMaps: true
		},
		fetchFromOriginalModuleSource: true,
		resolveModuleToPath: function(source, filename) {
			return renameWithoutJsExt(source, filename) + '.js';
		}
	});
}

function destAmd(options, destPath) {
	return gulp.dest(function(file) {
		file.path = path.join(file.base, getAmdModuleId(file.path, options.moduleName));
		return destPath.replace(/\\/g, '/');
	});
}

function renameWithoutJsExt(source, filename) {
	var renamed = renameAlias(source, filename);
	if (renamed.substr(renamed.length - 3) === '.js') {
		renamed = renamed.substr(0, renamed.length - 3);
	}
	return renamed;
}

function getAmdModuleId(moduleName, mainModuleName) {
	var result;
	if (moduleName.substr(0, 7) === 'module:') {
		result = moduleName.substr(7);
	} else {
		result = path.relative(getBowerDir(), moduleName);
		if (result[0] === '.') {
			result = path.join(mainModuleName, path.relative(process.cwd(), moduleName));
		}
	}
	return result.replace(/\\/g, '/');
}
