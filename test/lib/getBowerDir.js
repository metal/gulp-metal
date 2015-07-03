'use strict';

var assert = require('assert');
var rewire = require('rewire');
var sinon = require('sinon');

var getBowerDir = rewire('../../lib/getBowerDir');
var fakeBowerDirectory = {
	sync: sinon.stub().returns('/some/bower/components/path')
};

describe('getBowerDir', function() {
	before(function() {
		getBowerDir.__set__('bowerDirectory', fakeBowerDirectory);
	});

	it('should cache value of bowerDirectory.sync once and use it for all calls', function() {
		var originalValue = fakeBowerDirectory.sync();
		assert.strictEqual(originalValue, getBowerDir());

		fakeBowerDirectory.sync.returns(originalValue + '/another/path');
		assert.notStrictEqual(originalValue, fakeBowerDirectory.sync());
		assert.strictEqual(originalValue, getBowerDir());
	});
});
