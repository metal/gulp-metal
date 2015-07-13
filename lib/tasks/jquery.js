'use strict';

var build = require('../pipelines/build');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var handleError = require('../handleError');
var normalizeOptions = require('../options');
var sourcemaps = require('gulp-sourcemaps');
var wrapper = require('gulp-wrapper');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'build:jquery', [taskPrefix + 'soy'], function() {
		return gulp.src(options.buildSrc)
			.pipe(build.addJQueryAdapterRegistration())
			.pipe(sourcemaps.init())
			.pipe(build.buildGlobalsNoSourceMaps(options)).on('error', handleError)
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
