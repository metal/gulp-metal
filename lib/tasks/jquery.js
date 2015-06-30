'use strict';

var build = require('../build');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var normalizeOptions = require('../options');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var wrapper = require('gulp-wrapper');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'build:globals:jquery', [taskPrefix + 'soy'], function() {
		return gulp.src(options.buildSrc)
			.pipe(wrapper({
				footer: addJQueryAdapterRegistration
			}))
			.pipe(build.buildGlobals(options))
			.pipe(gulp.dest(options.buildGlobalsJqueryDest))
			.pipe(gulpif('*.js', build.buildMinify()))
			.pipe(gulp.dest(options.buildGlobalsJqueryDest));
	});

	gulp.task(taskPrefix + 'build:jquery', [taskPrefix + 'soy'], function() {
		return gulp.src(options.buildSrc)
			.pipe(wrapper({
				footer: addJQueryAdapterRegistration
			}))
			.pipe(sourcemaps.init())
			.pipe(build.buildGlobalsNoSourceMaps(options))
			.pipe(wrapper({
				header: 'new (function () { ',
				footer: '})();'
			}))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(options.buildJqueryDest))
			.pipe(gulpif('*.js', build.buildMinify()))
			.pipe(gulp.dest(options.buildJqueryDest));
	});
};

// Private helpers
function addJQueryAdapterRegistration(file) {
	if (file.path.substr(file.path.length - 7) === '.soy.js') {
		return '';
	}
	var className = path.basename(file.path);
	className = className.substr(0, className.length - 3);
	var classNameLowerCase = className[0].toLowerCase() + className.substr(1);
	return 'import JQueryAdapter from \'bower:metal-jquery-adapter/src/JQueryAdapter\';' +
		'JQueryAdapter.register(\'' + classNameLowerCase + '\', ' + className + ')';
}
