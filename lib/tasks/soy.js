'use strict';

var gulp = require('gulp');
var handleError = require('../handleError');
var compileSoy = require('metal-tools-soy').pipelines.compileSoy;
var normalizeOptions = require('../options');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'soy', function() {
		return gulp.src(options.soySrc)
			.pipe(compileSoy(options)).on('error', handleError)
			.pipe(gulp.dest(options.soyDest));
	});
};
