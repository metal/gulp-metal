'use strict';

var concat = require('gulp-concat');
var del = require('del');
var esformatter = require('gulp-esformatter');
var file = require('gulp-file');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var metaljs = require('metaljs');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');

function auiTasks(options) {
	options = normalizeOptions(options);

	metaljs(options);

	gulp.task('clean', function(done) {
		del('build', done);
	});

	gulp.task('build', function(done) {
		runSequence('clean', ['build:js', 'css'], done);
	});

	gulp.task('build:js', function(done) {
		runSequence('build:globals', done);
	});

	gulp.task('watch', function(done) { // jshint ignore:line
		gulp.watch(options.buildSrc, ['build:js']);
		gulp.watch(options.soySrc, ['soy']);
		gulp.watch(options.scssSrc, ['css']);
	});

	gulp.task('css:bootstrap', function() {
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

	gulp.task('css', ['css:bootstrap'], function() {
		return gulp.src(options.scssSrc)
			.pipe(sass().on('error', function(err) {
				sass.logError(err);
				this.emit('end');
			}))
			.pipe(concat(options.bundleCssFileName))
			.pipe(gulp.dest('build'));
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
}

function normalizeOptions(options) {
	var codeGlobs = ['src/**/*.js', '!src/**/*.soy.js', 'test/**/*.js', 'gulpfile.js'];

	options.buildDest = options.buildDest || 'build/globals';
	options.bundleCssFileName = options.bundleCssFileName || 'all.css';
	options.scssSrc = options.scssSrc || 'src/**/*.scss';
	options.soyGeneratedDest = options.soyGeneratedDest || 'build';

	options.formatGlobs = options.formatGlobs || codeGlobs;
	options.lintGlobs = options.lintGlobs || codeGlobs;
	return options;
}

module.exports = auiTasks;
