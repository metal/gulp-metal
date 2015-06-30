'use strict';

var del = require('del');
var gulp = require('gulp');
var handleError = require('../handleError');
var normalizeOptions = require('../options');
var soy = require('../pipelines/soy');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'soy', function(done) {
		gulp.src(options.soySrc)
			.pipe(soy.generateSoy())
			.pipe(gulp.dest(options.soyGeneratedDest))
			.pipe(soy.compileSoy(options)).on('error', handleError)
			.pipe(gulp.dest(options.soyDest))
			.on('end', function() {
				del('temp', done);
			});
	});
};
