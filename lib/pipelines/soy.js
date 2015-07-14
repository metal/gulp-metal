'use strict';

var combiner = require('stream-combiner');
var fs = require('fs');
var gutil = require('gulp-util');
var lodash = require('engine-lodash');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var soyparser = require('soyparser');
var templates = require('../templates');
var through = require('through2');

var parsedSoys = {};
var templateParams = {};

function generateJsComponent(options) {
	return through.obj(function(file, encoding, callback) {
		var jsPath = file.path.substr(0, file.path.length - 3) + 'js';
		if (!fs.existsSync(jsPath)) {
			var namespace = getParsedSoy(file.relative + '.js', file.contents).namespace;
			var contents = lodash.renderSync(templates.SoyComponent, {
				moduleName: namespace.substr(10)
			});
			var jsFile = new gutil.File({
				base: file.base,
				contents: new Buffer(contents),
				path: jsPath
			});
			this.push(jsFile);
		}
		this.push(file);
		callback();
	});
}

function compileSoy(options) {
	return combiner(
		extractParams(),
		plugins.soynode({
			loadCompiledTemplates: false,
			locales: options.soyLocales,
			messageFilePathFormat: options.soyMessageFilePathFormat,
			shouldDeclareTopLevelNamespaces: false
		}),
		plugins.ignore.exclude('*.soy'),
		plugins.wrapper({
			header: getHeaderContent(options.corePathFromSoy),
			footer: getFooterContent
		})
	);
}

function reset() {
	parsedSoys = {};
	templateParams = {};
}

module.exports.generateJsComponent = generateJsComponent;
module.exports.compileSoy = compileSoy;
module.exports.reset = reset;

// Private helpers
function addTemplateParam(soyJsPath, templateName, param) {
	templateParams[soyJsPath][templateName].push(param);
}

function extractParams() {
	return through.obj(function(file, encoding, callback) {
		var soyJsPath = file.relative + '.js';
		var parsed = getParsedSoy(soyJsPath, file.contents);
		var namespace = parsed.namespace;

		templateParams[soyJsPath] = {};
		parsed.templates.forEach(function(cmd) {
			if (cmd.deltemplate || cmd.attributes.private === 'true') {
				return;
			}

			var templateName = namespace + '.' + cmd.name;
			templateParams[soyJsPath][templateName] = [];
			cmd.params.forEach(function(tag) {
				if (tag.name !== '?') {
					addTemplateParam(soyJsPath, templateName, tag.name);
				}
			});
		});

		this.push(file);
		callback();
	});
}

function getFilenameNoLocale(filename) {
	return filename.replace(/_[^.]+\.soy/, '.soy');
}

function getFooterContent(file) {
	var footer = '';
	var pathNoLocale = getFilenameNoLocale(file.relative);
	var fileParams = templateParams[pathNoLocale];
	for (var templateName in fileParams) {
		footer += '\n' + templateName + '.params = ' + JSON.stringify(fileParams[templateName]) + ';';
	}
	footer += '\nexport default ' + getParsedSoy(pathNoLocale, file.contents).namespace + ';';
	return footer + '\n/* jshint ignore:end */\n';
}

function getHeaderContent(corePathFromSoy) {
	return function(file) {
		var corePath = corePathFromSoy;
		if (typeof corePath === 'function') {
			corePath = corePathFromSoy(file);
		}
		var registryModulePath = path.join(corePath, '/component/ComponentRegistry');
		return '/* jshint ignore:start */\n' +
			'import ComponentRegistry from \'' + registryModulePath + '\';\n' +
			'var Templates = ComponentRegistry.Templates;\n';
	};
}

function getParsedSoy(soyJsPath, contents) {
	if (!parsedSoys[soyJsPath]) {
		parsedSoys[soyJsPath] = soyparser(contents);
	}
	return parsedSoys[soyJsPath];
}
