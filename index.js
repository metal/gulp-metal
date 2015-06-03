'use strict';

var concat = require('gulp-concat');
var del = require('del');
var esformatter = require('gulp-esformatter');
var file = require('gulp-file');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var metaljs = require('metaljs');
var path = require('path');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var wrapper = require('gulp-wrapper');

function auiTasks(options) {
	options = normalizeOptions(options);

	metaljs(options);

	gulp.task('clean', function(done) {
		del('build', done);
	});

	gulp.task('build', function(done) {
		var buildTasks = ['build:js'];
		if (!options.skipCssBuild) {
			buildTasks.push('css');
		}
		runSequence('clean', buildTasks, done);
	});

	gulp.task('build:js', function(done) {
		runSequence('soy', ['build:globals:js', 'build:globals:jquery'], done);
	});

	gulp.task('build:globals:jquery', function() {
		return gulp.src(options.buildSrc)
			.pipe(wrapper({
				footer: function(file) {
					var className = path.basename(file.path);
					className = className.substr(0, className.length - 3);
					var classNameLowerCase = className[0].toLowerCase() + className.substr(1);
					return 'import JQueryAdapter from \'bower:metal-jquery-adapter/src/JQueryAdapter\';' +
						'JQueryAdapter.register(\'' + classNameLowerCase + '\', ' + className + ')';
				}
			}))
			.pipe(metaljs.buildLazyPipes.buildGlobals(options)())
			.pipe(gulp.dest(options.buildGlobalsJqueryDest));
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
	options.buildGlobalsJqueryDest = options.buildGlobalsJqueryDest || 'build/globals-jquery';
	options.bundleCssFileName = options.bundleCssFileName || 'all.css';
	options.scssSrc = options.scssSrc || 'src/**/*.scss';
	options.skipCssBuild = !!options.skipCssBuild;
	options.soyGeneratedDest = options.soyGeneratedDest || 'build';

	options.formatGlobs = options.formatGlobs || codeGlobs;
	options.lintGlobs = options.lintGlobs || codeGlobs;
	return options;
}

module.exports = auiTasks;
