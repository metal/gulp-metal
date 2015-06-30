'use strict';

var build = require('../build');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var handleError = require('../handleError');
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
			.pipe(build.buildGlobals(options)).on('error', handleError)
			.pipe(gulp.dest(options.buildDest))
			.pipe(gulpif('*.js', build.buildMinify()))
			.pipe(gulp.dest(options.buildDest));
	});
};
