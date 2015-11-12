'use strict';

var path = require('path');

function normalizeOptions(options) {
	var codeGlobs = ['src/**/*.js', '!src/**/*.soy.js', 'test/**/*.js', 'gulpfile.js'];

	options = options || {};
	options.buildAmdDest = options.buildAmdDest || 'build/amd';
	options.buildGlobalsJqueryDest = options.buildGlobalsJqueryDest || 'build/globals-jquery';
	options.buildAmdJqueryDest = options.buildAmdJqueryDest || 'build/amd-jquery';
	options.buildJqueryDest = options.buildJqueryDest || 'build/jquery';
	options.bundleCssFileName = options.bundleCssFileName || 'all.css';
	options.bundleFileName = options.bundleFileName || 'metal.js';
	options.buildDest = options.buildDest || 'build/globals';
	options.buildSrc = options.buildSrc || 'src/**/*.js';
	options.cleanDir = options.cleanDir || 'build';
	options.corePathFromSoy = options.corePathFromSoy || 'bower:metal/src';
	options.cssDest = options.cssDest || 'build';
	options.cssSrc = options.cssSrc || 'src/**/*.css';
	options.formatGlobs = options.formatGlobs || codeGlobs;
	options.globalName = options.globalName || 'metal';
	options.jsDocConfFile = options.jsDocConfFile || path.resolve(__dirname, '../jsdoc.json');
	options.lintGlobs = options.lintGlobs || codeGlobs;
	options.moduleName = options.moduleName || 'metal';
	options.scssIncludePaths = options.scssIncludePaths || ['bower_components'];
	options.scssSrc = options.scssSrc || 'src/**/*.scss';
	options.soyDest = options.soyDest || 'src';
	options.soyLocales = options.soyLocales;
	options.soyMessageFilePathFormat = options.soyMessageFilePathFormat;
	options.soySrc = options.soySrc || 'src/**/*.soy';
	options.taskPrefix = options.taskPrefix || '';
	options.mainBuildJsTasks = options.mainBuildJsTasks || [options.taskPrefix + 'build:globals'];

	return options;
}

module.exports = normalizeOptions;
