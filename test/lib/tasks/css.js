'use strict';

var assert = require('assert');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var registerTasks = require('../../../lib/tasks/index');
var sinon = require('sinon');

describe('CSS Task', function() {
	before(function() {
		this.initialCwd_ = process.cwd();
		process.chdir(path.resolve(__dirname, '../assets'));
	});

	after(function() {
		process.chdir(this.initialCwd_);
	});

	it('should trigger "end" event even when task throws error for invalid sass file', function(done) {
		registerTasks({
			scssSrc: 'css/invalid.scss'
		});
		sinon.stub(console, 'error');

		gulp.start('css', function() {
			assert.strictEqual(1, console.error.callCount);
			console.error.restore();
			done();
		});
	});
});
