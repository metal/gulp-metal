'use strict';

var babelDeps = require('gulp-babel-deps');
var babelPluginAmd = require('babel-plugin-transform-es2015-modules-amd');
var babelPluginClasses = require('babel-plugin-transform-es2015-classes');
var babelPresetEs2015 = require('babel-preset-es2015');
var build = require('../pipelines/build');
var combiner = require('stream-combiner');
var getBowerDir = require('../getBowerDir');
var gulp = require('gulp');
var normalizeOptions = require('../options');
var path = require('path');
var renameAlias = require('../renameAlias');
var sourcemaps = require('gulp-sourcemaps');
var wrapper = require('gulp-wrapper');

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
		wrapper({
			footer: function(file) {
				return '\n//# sourceMappingURL=' + path.basename(file.path) + '.map';
			}
		}),
		sourcemaps.write('./', {addComment: false})
	);
}

function buildAmdNoSourceMaps(options) {
	return babelDeps({
		babel: {
			compact: false,
			resolveModuleSource: function(source, filename) {
				return getAmdModuleId(renameWithoutJsExt(source, filename), options.moduleName);
			},
			plugins: [
				babelPluginAmd,
				[babelPluginClasses, {loose: true}]
			],
			presets: [babelPresetEs2015],
			sourceMaps: true
		},
		fetchFromOriginalModuleSource: true,
		resolveModuleToPath: function(moduleName, filename) {
			var modulePath = modulesToPath[moduleName] ? modulesToPath[moduleName] : renameWithoutJsExt(moduleName, filename);
			return modulePath + '.js';
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

var modulesToPath = {};
function getAmdModuleId(source, mainModuleName) {
	var result;
	var hasModulePrefix = false;
	if (source.substr(0, 7) === 'module:') {
		result = source.substr(7);
		hasModulePrefix = true;
	} else {
		result = path.relative(getBowerDir(), source);
		if (result[0] === '.') {
			result = path.join(mainModuleName, path.relative(process.cwd(), source));
		}
	}
	result = result.replace(/\\/g, '/');

	if (!hasModulePrefix) {
		modulesToPath[result] = source;
	}
	return result;

}
