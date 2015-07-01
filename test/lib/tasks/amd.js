'use strict';

var assert = require('assert');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var registerSoyTasks = require('../../../lib/tasks/soy');
var rewire = require('rewire');

var registerAmdTasks = rewire('../../../lib/tasks/amd');
var renameAlias = rewire('../../../lib/renameAlias');

describe('AMD Build Task', function() {
	before(function() {
		this.initialCwd_ = process.cwd();
		process.chdir(path.resolve(__dirname, '../assets'));

		function getBowerDir() {
			return path.resolve('bower_components');
		}

		renameAlias.__set__('getBowerDir',  getBowerDir);
		registerAmdTasks.__set__('getBowerDir',  getBowerDir);
		registerAmdTasks.__set__('renameAlias',  renameAlias);

		registerSoyTasks();
	});

	beforeEach(function(done) {
		del('build/amd', done);
	});

	after(function() {
		process.chdir(this.initialCwd_);
	});

	it('should output source files and their dependencies as amd modules', function(done) {
		registerAmdTasks({
			moduleName: 'foo'
		});

		gulp.start('build:amd', function() {
			assert.ok(fs.existsSync('build/amd/foo/src/Foo.js'));
			assert.ok(fs.existsSync('build/amd/foo/src/Bar.js'));
			assert.ok(fs.existsSync('build/amd/dep/src/core.js'));
			done();
		});
	});

	it('should look for source files according to the value of the "buildSrc" option', function(done) {
		registerAmdTasks({
			buildSrc: 'src/Bar.js',
			moduleName: 'foo'
		});

		gulp.start('build:amd', function() {
			assert.ok(!fs.existsSync('build/amd/foo/src/Foo.js'));
			assert.ok(fs.existsSync('build/amd/foo/src/Bar.js'));
			assert.ok(!fs.existsSync('build/amd/dep/src/core.js'));
			done();
		});
	});

	it('should use task prefix when it\'s defined', function(done) {
		var options = {
			moduleName: 'foo',
			taskPrefix: 'myPrefix:'
		};
		registerAmdTasks(options);
		registerSoyTasks(options);

		gulp.start('myPrefix:build:amd', function() {
			assert.ok(fs.existsSync('build/amd/foo/src/Foo.js'));
			assert.ok(fs.existsSync('build/amd/foo/src/Bar.js'));
			assert.ok(fs.existsSync('build/amd/dep/src/core.js'));
			done();
		});
	});
});
