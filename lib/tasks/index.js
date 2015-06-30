'use strict';

var amdTasks = require('./amd');
var cssTasks = require('./css');
var esformatter = require('gulp-esformatter');
var globalsTasks = require('./globals');
var jqueryTasks = require('./jquery');
var jshint = require('gulp-jshint');
var del = require('del');
var gulp = require('gulp');
var normalizeOptions = require('../options');
var runSequence = require('run-sequence');
var soyTasks = require('./soy');
var testTasks = require('./test');

module.exports = function(options) {
	options = normalizeOptions(options);
	amdTasks(options);
	cssTasks(options);
	globalsTasks(options);
	jqueryTasks(options);
	soyTasks(options);
	testTasks(options);

	gulp.task('clean', function(done) {
		del(options.cleanDir, done);
	});

	gulp.task('build', function(done) {
		runSequence('clean', ['css', 'build:js'], done);
	});

	gulp.task('build:js', function(done) {
		runSequence(options.mainBuildJsTasks, done);
	});

	gulp.task('build:all', function(done) {
		runSequence('clean', ['css', 'build:all:js'], done);
	});

	gulp.task('build:all:js', function(done) {
		runSequence(['build:globals', 'build:globals:jquery', 'build:jquery', 'build:amd'], done);
	});

	gulp.task('watch', function(done) { // jshint ignore:line
		gulp.watch(options.buildSrc, ['build:js']);
		gulp.watch(options.soySrc, ['soy']);
		gulp.watch(options.scssSrc, ['css']);
	});

	gulp.task('format', function() {
	  var gulpOpts = {
	    base: process.cwd()
	  };
	  return gulp.src(options.formatGlobs, gulpOpts)
	    .pipe(esformatter({
				indent: {
					value: '	'
				}
			}))
	    .pipe(gulp.dest(process.cwd()));
	});

	gulp.task('lint', function() {
	  return gulp.src(options.lintGlobs)
	    .pipe(jshint())
	    .pipe(jshint.reporter(require('jshint-stylish')));
	});
};
