'use strict';

var babelGlobals = require('gulp-babel-globals');
var babelPluginClasses = require('babel-plugin-transform-es2015-classes');
var babelPresetEs2015 = require('babel-preset-es2015');
var combiner = require('stream-combiner');
var path = require('path');
var rename = require('gulp-rename');
var renameAlias = require('../renameAlias');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var wrapper = require('gulp-wrapper');

function addJQueryAdapterRegistration() {
	return wrapper({
		footer: function addJQueryAdapterRegistration(file) {
			if (file.path.substr(file.path.length - 7) === '.soy.js') {
				return '';
			}
			var className = path.basename(file.path);
			className = className.substr(0, className.length - 3);
			var classNameLowerCase = className[0].toLowerCase() + className.substr(1);
			return 'import JQueryAdapter from \'bower:metal-jquery-adapter/src/JQueryAdapter\';' +
				'JQueryAdapter.register(\'' + classNameLowerCase + '\', ' + className + ')';
		}
	});
}

function buildGlobalsNoSourceMaps(options) {
	return babelGlobals({
		babel: {
			compact: false,
			resolveModuleSource: renameAlias,
			plugins: [[babelPluginClasses, {loose: true}]],
			presets: [babelPresetEs2015],
			sourceMaps: true
		},
		bundleFileName: options.bundleFileName,
		globalName: options.globalName
	});
}

function buildGlobals(options) {
	return combiner(
		sourcemaps.init(),
		buildGlobalsNoSourceMaps(options),
		sourcemaps.write('./')
	);
}

function buildMinify() {
	return combiner(
		rename({
			suffix: '-min'
		}),
		uglify({
			compress: {
				drop_console: true
			},
			preserveComments: 'some'
		})
	);
}

module.exports.addJQueryAdapterRegistration = addJQueryAdapterRegistration;
module.exports.buildGlobals = buildGlobals;
module.exports.buildGlobalsNoSourceMaps = buildGlobalsNoSourceMaps;
module.exports.buildMinify = buildMinify;
