'use strict';

var getBowerDir = require('./getBowerDir');
var path = require('path');

function renameAlias(originalPath, parentPath) {
	var result;

	if (originalPath[0] === '.') {
		result = path.resolve(path.dirname(parentPath), originalPath);
	} else if (originalPath.substr(0, 6) === 'bower:') {
		result = path.join(getBowerDir(), originalPath.substr(6));
	} else {
		result = originalPath;
	}

	return result.replace(/\\/g, '/');
}

module.exports = renameAlias;
