'use strict';

var del = require('del');
var esformatter = require('gulp-esformatter');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var metaljs = require('metaljs');
var runSequence = require('run-sequence');

function auiTasks(options) {
	options = normalizeOptions(options);

	metaljs(options);

	gulp.task('clean', function(done) {
		del('build', done);
	});

	gulp.task('build', function(done) {
		runSequence('clean', 'build:globals', done);
	});

	gulp.task('format', function() {
	  var gulpOpts = {
	    base: process.cwd()
	  };
	  return gulp.src(options.formatGlobs, gulpOpts)
	    .pipe(esformatter())
	    .pipe(gulp.dest(process.cwd()));
	});

	gulp.task('lint', function() {
	  return gulp.src(options.lintGlobs)
	    .pipe(jshint())
	    .pipe(jshint.reporter(require('jshint-stylish')));
	});
}

function normalizeOptions(options) {
	var codeGlobs = ['src/**/*.js', '!src/**/*.soy.js', 'test/**/*.js', 'gulpfile.js'];

	options.buildDest = options.buildDest || 'build/globals';
	options.formatGlobs = options.formatGlobs || codeGlobs;
	options.lintGlobs = options.lintGlobs || codeGlobs;
	return options;
}

module.exports = auiTasks;
