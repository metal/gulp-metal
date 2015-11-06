'use strict';

var del = require('del');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var handleError = require('../handleError');
var normalizeOptions = require('../options');
var soy = require('../pipelines/soy');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'soy', function(done) {
		gulp.src(options.soySrc)
			.pipe(gulpif('*.soy', soy.compileSoy(options))).on('error', handleError)
			.pipe(gulp.dest(options.soyDest))
			.on('end', function() {
				del('temp').then(function() {
					done();
				});
			});
	});
};
