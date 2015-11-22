'use strict';

var assert = require('assert');
var rewire = require('rewire');

var getBowerDir = rewire('../../lib/getBowerDir');

describe('getBowerDir', function() {
	it('should return value of bowerDirectory', function() {
		assert.strictEqual(getBowerDir({cwd: '/foo/bah'}), '/foo/bah/bower_components');
	});
});
