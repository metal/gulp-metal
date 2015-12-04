'use strict';

var buildJQuery = require('metal-tools-build-jquery/lib/pipelines/buildJQuery');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var handleError = require('../handleError');
var minify = require('../pipelines/minify');
var normalizeOptions = require('../options');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'build:jquery', [taskPrefix + 'soy'], function() {
		return gulp.src(options.buildSrc)
			.pipe(buildJQuery(options)).on('error', handleError)
			.pipe(gulp.dest(options.buildJqueryDest))
			.pipe(gulpif('*.js', minify()))
			.pipe(gulp.dest(options.buildJqueryDest));
	});
};
