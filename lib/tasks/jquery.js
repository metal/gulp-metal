'use strict';

var buildJQuery = require('metal-tools-build-jquery/lib/pipelines/buildJQuery');
var handleError = require('../handleError');
var normalizeOptions = require('../options');
var runSequence = require('run-sequence');

module.exports = function(options) {
	options = normalizeOptions(options);
	var gulp = options.gulp;
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'build:jquery:js', function() {
		return gulp.src(options.buildSrc)
			.pipe(buildJQuery(options)).on('error', handleError)
			.pipe(gulp.dest(options.buildJqueryDest));
	});

	gulp.task(taskPrefix + 'build:jquery', [taskPrefix + 'soy'], function(done) {
		runSequence(taskPrefix + 'build:jquery:js', done);
	});
};
