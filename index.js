'use strict';

var babelDeps = require('gulp-babel-deps');
var concat = require('gulp-concat');
var del = require('del');
var esformatter = require('gulp-esformatter');
var file = require('gulp-file');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var metal = require('./metal');
var path = require('path');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var wrapper = require('gulp-wrapper');

function auiTasks(options) {
	options = normalizeOptions(options);

	metal(options);

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
		runSequence('soy', ['build:globals:js', 'build:globals:jquery', 'build:jquery', 'build:amd'], done);
	});

	gulp.task('build:globals:jquery', function() {
		return gulp.src(options.buildSrc)
			.pipe(wrapper({
				footer: addJQueryAdapterRegistration
			}))
			.pipe(sourcemaps.init())
			.pipe(metal.buildLazyPipes.buildGlobals(options)())
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(options.buildGlobalsJqueryDest));
	});

	gulp.task('build:jquery', function() {
		return gulp.src(options.buildSrc)
			.pipe(wrapper({
				footer: addJQueryAdapterRegistration
			}))
			.pipe(sourcemaps.init())
			.pipe(metal.buildLazyPipes.buildGlobals(options)())
			.pipe(wrapper({
				header: 'new (function () { ',
				footer: '})();'
			}))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(options.buildJqueryDest));
	});

	gulp.task('build:amd', function() {
		return gulp.src(options.buildSrc, {base: process.cwd()})
			.pipe(babelDeps({
				babel: {
					compact: false,
					modules: 'amd',
					resolveModuleSource: function(source, filename) {
						return getAmdModuleId(renameWithoutJsExt(source, filename), options.moduleName);
					},
					sourceMaps: true
				},
				fetchFromOriginalModuleSource: true,
				resolveModuleToPath: function(source, filename) {
					return renameWithoutJsExt(source, filename) + '.js';
				}
			}))
			.pipe(gulp.dest(function(file) {
				file.path = path.join(file.base, getAmdModuleId(file.path, options.moduleName));
				return options.buildAmdDest;
			}));
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

	options.buildAmdDest = options.buildAmdDest || 'build/amd';
	options.buildDest = options.buildDest || 'build/globals';
	options.buildGlobalsJqueryDest = options.buildGlobalsJqueryDest || 'build/globals-jquery';
	options.buildJqueryDest = options.buildJqueryDest || 'build/jquery';
	options.bundleCssFileName = options.bundleCssFileName || 'all.css';
	options.moduleName = options.moduleName || 'metal';
	options.scssSrc = options.scssSrc || 'src/**/*.scss';
	options.skipCssBuild = !!options.skipCssBuild;
	options.soyGeneratedDest = options.soyGeneratedDest || 'build';

	options.formatGlobs = options.formatGlobs || codeGlobs;
	options.lintGlobs = options.lintGlobs || codeGlobs;
	return options;
}

function addJQueryAdapterRegistration(file) {
	if (file.path.substr(file.path.length - 7) === '.soy.js') {
		return '';
	}
	var className = path.basename(file.path);
	className = className.substr(0, className.length - 3);
	var classNameLowerCase = className[0].toLowerCase() + className.substr(1);
	return 'import JQueryAdapter from \'bower:metal-jquery-adapter/src/JQueryAdapter\';' +
		'JQueryAdapter.register(\'' + classNameLowerCase + '\', ' + className + ')';
}

function renameWithoutJsExt(source, filename) {
	var renamed = metal.renameAlias(source, filename);
	if (renamed.substr(renamed.length - 3) === '.js') {
		renamed = renamed.substr(0, renamed.length - 3);
	}
	return renamed;
}

function getAmdModuleId(moduleName, mainModuleName) {
	var bowerDir = path.resolve('bower_components');
	var relative = path.relative(bowerDir, moduleName);
	if (relative[0] === '.') {
		return path.join(mainModuleName, path.relative(process.cwd(), moduleName));
	} else {
		return relative;
	}
}

module.exports = auiTasks;
