'use strict';

var bowerDirectory = require('bower-directory');

var bowerDirCache;

/**
 * This function returns the same value as `bowerDirectory.sync()`, but
 * caches it for future calls, instead of recalculating the bower directory
 * path each time like the original function does.
 * @return {[type]} [description]
 */
function getBowerDir() {
	if (!bowerDirCache) {
		bowerDirCache = bowerDirectory.sync();
	}
	return bowerDirCache;
}

module.exports = getBowerDir;
