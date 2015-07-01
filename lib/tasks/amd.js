'use strict';

var babelDeps = require('gulp-babel-deps');
var getBowerDir = require('../bowerDirectory');
var gulp = require('gulp');
var normalizeOptions = require('../options');
var path = require('path');
var renameAlias = require('../renameAlias');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'build:amd', [taskPrefix + 'soy'], function() {
		return gulp.src(options.buildSrc, {base: process.cwd()})
			.pipe(babelDeps({
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
			}))
			.pipe(gulp.dest(function(file) {
				file.path = path.join(file.base, getAmdModuleId(file.path, options.moduleName));
				return options.buildAmdDest;
			}));
	});
};

function renameWithoutJsExt(source, filename) {
	var renamed = renameAlias(source, filename);
	if (renamed.substr(renamed.length - 3) === '.js') {
		renamed = renamed.substr(0, renamed.length - 3);
	}
	return renamed;
}

function getAmdModuleId(moduleName, mainModuleName) {
	var relative = path.relative(getBowerDir(), moduleName);
	if (relative[0] === '.') {
		return path.join(mainModuleName, path.relative(process.cwd(), moduleName));
	} else {
		return relative;
	}
}
