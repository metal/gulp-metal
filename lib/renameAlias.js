'use strict';

var getBowerDir = require('./getBowerDir');
var path = require('path');

function renameAlias(originalPath, parentPath) {
	if (originalPath[0] === '.') {
		return path.resolve(path.dirname(parentPath), originalPath);
	} else if (originalPath.substr(0, 6) === 'bower:') {
		return path.join(getBowerDir(), originalPath.substr(6));
	} else {
		return originalPath;
	}
}

module.exports = renameAlias;
