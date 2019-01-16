'use strict';

var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var handleError = require('../handleError');
var normalizeOptions = require('../options');
var sass = require('gulp-sass');

module.exports = function(options) {
	options = normalizeOptions(options);
	var gulp = options.gulp;
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'css', function() {
		var sassOpts = {
			includePaths: options.scssIncludePaths
		};
		return gulp.src(concatSrcs(options.scssSrc, options.cssSrc))
			.pipe(sass(sassOpts).on('error', function(error) {
				handleError.call(this, error, 'sass');
			}))
			.pipe(concat(options.bundleCssFileName))
			.pipe(autoprefixer({
				browsers: [
					'> 1%',
					'OperaMini'
				]
			}))
			.pipe(gulp.dest(options.cssDest));
	});
};

function concatSrcs(src1, src2) {
	src1 = Array.isArray(src1) ? src1 :[src1];
	src2 = Array.isArray(src2) ? src2 :[src2];
	return src1.concat(src2);
}
