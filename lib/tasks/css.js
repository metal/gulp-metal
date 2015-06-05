'use strict';

var concat = require('gulp-concat');
var file = require('gulp-file');
var gulp = require('gulp');
var normalizeOptions = require('../options');
var sass = require('gulp-sass');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'css:bootstrap', function() {
		var fileOpts = {
			src: true
		};
		return file('bootstrap.scss', '@import "bootstrap";', fileOpts)
			.pipe(sass({
				includePaths: ['bower_components/bootstrap-sass/assets/stylesheets'],
			}).on('error', function(err) {
				sass.logError(err);
				this.emit('end');
			}))
			.pipe(gulp.dest('build'));
	});

	gulp.task(taskPrefix + 'css', [taskPrefix + 'css:bootstrap'], function() {
		return gulp.src(options.scssSrc)
			.pipe(sass().on('error', function(err) {
				sass.logError(err);
				this.emit('end');
			}))
			.pipe(concat(options.bundleCssFileName))
			.pipe(gulp.dest('build'));
	});
};
