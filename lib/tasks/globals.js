'use strict';

var addJQueryAdapterRegistration = require('metal-tools-build-jquery/lib/pipelines/addJQueryAdapterRegistration');
var buildGlobals = require('metal-tools-build-globals/lib/pipelines/buildGlobals');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var handleError = require('../handleError');
var minify = require('../pipelines/minify');
var normalizeOptions = require('../options');
var runSequence = require('run-sequence');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'build:globals', function(done) {
		runSequence(taskPrefix + 'soy', taskPrefix + 'build:globals:js', function() {
			done();
		});
	});

	gulp.task(taskPrefix + 'build:globals:js', function() {
		return gulp.src(options.buildSrc)
			.pipe(buildGlobals(options)).on('error', handleError)
			.pipe(gulp.dest(options.buildDest))
			.pipe(gulpif('*.js', minify()))
			.pipe(gulp.dest(options.buildDest));
	});

	gulp.task(taskPrefix + 'build:globals:jquery', [taskPrefix + 'soy'], function() {
		return gulp.src(options.buildSrc)
			.pipe(addJQueryAdapterRegistration())
			.pipe(buildGlobals(options)).on('error', handleError)
			.pipe(gulp.dest(options.buildGlobalsJqueryDest))
			.pipe(gulpif('*.js', minify()))
			.pipe(gulp.dest(options.buildGlobalsJqueryDest));
	});
};
