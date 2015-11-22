'use strict';

var path = require('path');
var bowerConfig = require('bower/lib/config');

function getBowerDir(option) {
	option = option || {};

  option.cwd = option.cwd || process.cwd();

  return path.resolve(option.cwd, bowerConfig(option).directory);
}

module.exports = getBowerDir;
