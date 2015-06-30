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

	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'clean', function(done) {
		del(options.cleanDir, done);
	});

	gulp.task(taskPrefix + 'build', function(done) {
		runSequence(taskPrefix + 'clean', [taskPrefix + 'css', taskPrefix + 'build:js'], done);
	});

	gulp.task(taskPrefix + 'build:js', function(done) {
		runSequence(options.mainBuildJsTasks, done);
	});

	gulp.task(taskPrefix + 'build:all', function(done) {
		runSequence(taskPrefix + 'clean', [taskPrefix + 'css', taskPrefix + 'build:all:js'], done);
	});

	gulp.task(taskPrefix + 'build:all:js', function(done) {
		runSequence(
			[
				taskPrefix + 'build:globals',
				taskPrefix + 'build:globals:jquery',
				taskPrefix + 'build:jquery',
				taskPrefix + 'build:amd'
			],
			done
		);
	});

	gulp.task(taskPrefix + 'watch', function(done) { // jshint ignore:line
		gulp.watch(options.buildSrc, [taskPrefix + 'build:js']);
		gulp.watch(options.soySrc, [taskPrefix + 'soy']);
		gulp.watch(options.scssSrc, [taskPrefix + 'css']);
	});

	gulp.task(taskPrefix + 'format', function() {
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

	gulp.task(taskPrefix + 'lint', function() {
	  return gulp.src(options.lintGlobs)
	    .pipe(jshint())
	    .pipe(jshint.reporter(require('jshint-stylish')));
	});
};
