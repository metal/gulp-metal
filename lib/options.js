'use strict';

var path = require('path');

function normalizeOptions(options) {
	var codeGlobs = ['src/**/*.js', '!src/**/*.soy.js', 'test/**/*.js', 'gulpfile.js'];

	options = options || {};

	if (options.pathPrefix) {
		options.pathPrefix = path.resolve(options.pathPrefix) + '/';
	}
	else {
		options.pathPrefix = '';
	}

	options.taskPrefix = options.taskPrefix || '';
	options.buildAmdDest = options.buildAmdDest || options.pathPrefix + 'build/amd';
	options.buildGlobalsJqueryDest = options.buildGlobalsJqueryDest || options.pathPrefix + 'build/globals-jquery';
	options.buildAmdJqueryDest = options.buildAmdJqueryDest || options.pathPrefix + 'build/amd-jquery';
	options.buildJqueryDest = options.buildJqueryDest || options.pathPrefix + 'build/jquery';
	options.bundleCssFileName = options.bundleCssFileName || 'all.css';
	options.bundleFileName = options.bundleFileName || 'metal.js';
	options.buildDest = options.buildDest || options.pathPrefix + 'build/globals';
	options.buildSrc = options.buildSrc || options.pathPrefix + 'src/**/*.js';
	options.cleanDir = options.cleanDir || options.pathPrefix + 'build';
	options.corePathFromSoy = options.corePathFromSoy || options.pathPrefix + 'bower:metal/src';
	options.cssDest = options.cssDest || options.pathPrefix + 'build';
	options.cssSrc = options.cssSrc || options.pathPrefix + 'src/**/*.css';
	options.formatGlobs = options.formatGlobs || codeGlobs;
	options.globalName = options.globalName || 'metal';
	options.jsDocConfFile = options.jsDocConfFile || path.resolve(__dirname, '../jsdoc.json');
	options.lintGlobs = options.lintGlobs || codeGlobs;
	options.moduleName = options.moduleName || 'metal';
	options.scssIncludePaths = options.scssIncludePaths || [options.pathPrefix + 'bower_components'];
	options.scssSrc = options.scssSrc || options.pathPrefix + 'src/**/*.scss';
	options.soyDest = options.soyDest || options.pathPrefix + 'src';
	options.soyLocales = options.soyLocales;
	options.soyMessageFilePathFormat = options.soyMessageFilePathFormat;
	options.soySrc = options.soySrc || options.pathPrefix + 'src/**/*.soy';
	options.taskPrefix = options.taskPrefix || '';
	options.mainBuildJsTasks = options.mainBuildJsTasks || [options.taskPrefix + 'build:globals'];

	return options;
}

module.exports = normalizeOptions;
