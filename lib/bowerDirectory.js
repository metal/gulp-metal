'use strict';

var bowerDirectory = require('bower-directory');

var bowerDirCache;
function getBowerDir() {
	if (!bowerDirCache) {
		bowerDirCache = bowerDirectory.sync();
	}
	return bowerDirCache;
}

module.exports = getBowerDir;
