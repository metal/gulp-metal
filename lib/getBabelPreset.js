'use strict';

var babelPluginRegisterComponents = require('babel-plugin-metal-register-components');
var babelPresetMetal = require('babel-preset-metal');

function getBabelPreset(options) {
	if (options.skipAutoComponentRegistration) {
		return getPresetWithoutComponentRegistration();
	} else {
		return babelPresetMetal;
	}
}

function getPresetWithoutComponentRegistration() {
	var preset = {};
	for (var key in babelPresetMetal) {
		if (key === 'plugins') {
			preset.plugins = babelPresetMetal.plugins.concat();
			preset.plugins.splice(preset.plugins.indexOf(babelPluginRegisterComponents), 1);
		} else {
			preset[key] = babelPresetMetal[key];
		}
	}
	return preset;
}

module.exports = getBabelPreset;
