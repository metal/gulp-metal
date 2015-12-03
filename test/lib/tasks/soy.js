'use strict';

var assert = require('assert');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var registerTasks = require('../../../lib/tasks/index');
var sinon = require('sinon');

describe('Soy Task', function() {
	beforeEach(function(done) {
		gulp.reset();
		del('test/assets/soy/*.soy.js').then(function() {
			done();
		});
	});

	it('should compile soy js files', function(done) {
		registerTasks({
			soyDest: 'test/assets/soy',
			soySrc: ['test/assets/soy/simple.soy']
		});

		gulp.start('soy', function() {
			assert.ok(fs.existsSync('test/assets/soy/simple.soy.js'));
			done();
		});
	});

	it('should use task prefix when it\'s defined', function(done) {
		registerTasks({
			soyDest: 'test/assets/soy',
			soySrc: ['test/assets/soy/simple.soy'],
			taskPrefix: 'myPrefix:'
		});

		gulp.start('myPrefix:soy', function() {
			assert.ok(fs.existsSync('test/assets/soy/simple.soy.js'));
			done();
		});
	});

	it('should trigger "end" event even when task throws error for invalid soy file', function(done) {
		registerTasks({
			soyDest: 'test/assets/soy',
			soySrc: ['test/assets/soy/invalid.soy']
		});
		sinon.stub(console, 'error');

		gulp.start('soy', function() {
			assert.strictEqual(2, console.error.callCount);
			console.error.restore();
			done();
		});
	});
});
