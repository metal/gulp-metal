'use strict';

var addJQueryAdapterRegistration = require('metal-tools-build-jquery/lib/pipelines/addJQueryAdapterRegistration');
var buildAmd = require('metal-tools-build-amd/lib/pipelines/buildAmd');
var gulp = require('gulp');
var normalizeOptions = require('../options');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'build:amd', [taskPrefix + 'soy'], function() {
		return gulp.src(options.buildSrc, {base: process.cwd()})
			.pipe(buildAmd(options))
			.pipe(gulp.dest(options.buildAmdDest));
	});

	gulp.task(taskPrefix + 'build:amd:jquery', [taskPrefix + 'soy'], function() {
		return gulp.src(options.buildSrc, {base: process.cwd()})
			.pipe(addJQueryAdapterRegistration())
			.pipe(buildAmd(options))
			.pipe(gulp.dest(options.buildAmdJqueryDest));
	});
};
