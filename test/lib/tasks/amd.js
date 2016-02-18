'use strict';

var assert = require('assert');
var babelDeps = require('babel-deps');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var registerAmdTasks = require('../../../lib/tasks/amd');
var registerSoyTasks = require('../../../lib/tasks/soy');

describe('AMD Build Task', function() {
	beforeEach(function(done) {
		babelDeps.clearCache();
		gulp.reset();
		registerSoyTasks();
		del('test/assets/build/amd').then(function() {
			done();
		});
	});

	it('should output source files and their dependencies as amd modules', function(done) {
		registerAmdTasks({
			buildSrc: ['test/assets/src/**.js'],
			buildAmdDest: 'test/assets/build/amd',
			moduleName: 'foo'
		});

		gulp.start('build:amd', function() {
			assert.ok(fs.existsSync('test/assets/build/amd/foo/test/assets/src/Foo.js'));
			assert.ok(fs.existsSync('test/assets/build/amd/foo/test/assets/src/Bar.js'));
			assert.ok(fs.existsSync('test/assets/build/amd/metal/src/core.js'));
			done();
		});
	});

	it('should use task prefix when it\'s defined', function(done) {
		var options = {
			buildSrc: ['test/assets/src/**.js'],
			buildAmdDest: 'test/assets/build/amd',
			moduleName: 'foo',
			taskPrefix: 'myPrefix:'
		};
		registerAmdTasks(options);
		registerSoyTasks(options);

		gulp.start('myPrefix:build:amd', function() {
			assert.ok(fs.existsSync('test/assets/build/amd/foo/test/assets/src/Foo.js'));
			assert.ok(fs.existsSync('test/assets/build/amd/foo/test/assets/src/Bar.js'));
			assert.ok(fs.existsSync('test/assets/build/amd/metal/src/core.js'));
			done();
		});
	});

	describe('jQuery', function() {
		beforeEach(function(done) {
			del('test/assets/build/amd-jquery').then(function() {
				done();
			});
		});

		it('should output source files and their dependencies as amd modules with jquery', function(done) {
			registerAmdTasks({
				buildSrc: ['test/assets/src/**.js'],
				buildAmdJqueryDest: 'test/assets/build/amd-jquery',
				moduleName: 'foo'
			});

			gulp.start('build:amd:jquery', function() {
				assert.ok(fs.existsSync('test/assets/build/amd-jquery/foo/test/assets/src/Foo.js'));
				assert.ok(fs.existsSync('test/assets/build/amd-jquery/foo/test/assets/src/Bar.js'));
				assert.ok(fs.existsSync('test/assets/build/amd-jquery/metal/src/core.js'));

				var contents = fs.readFileSync('test/assets/build/amd-jquery/foo/test/assets/src/Foo.js', 'utf8');
				assert.notStrictEqual(-1, contents.indexOf('_JQueryAdapter2.default.register(\'foo\', Foo)'));
				done();
			});
		});

		it('should output a source map file for each amd module', function(done) {
			registerAmdTasks({
				buildSrc: ['test/assets/src/**.js'],
				buildAmdJqueryDest: 'test/assets/build/amd-jquery',
				moduleName: 'foo'
			});

			gulp.start('build:amd:jquery', function() {
				assert.ok(fs.existsSync('test/assets/build/amd-jquery/foo/test/assets/src/Foo.js.map'));
				assert.ok(fs.existsSync('test/assets/build/amd-jquery/foo/test/assets/src/Bar.js.map'));
				assert.ok(fs.existsSync('test/assets/build/amd-jquery/metal/src/core.js.map'));
				done();
			});
		});

		it('should use task prefix when it\'s defined', function(done) {
			var options = {
				buildSrc: ['test/assets/src/**.js'],
				buildAmdJqueryDest: 'test/assets/build/amd-jquery',
				moduleName: 'foo',
				taskPrefix: 'myPrefix:'
			};
			registerAmdTasks(options);
			registerSoyTasks(options);

			gulp.start('myPrefix:build:amd:jquery', function() {
				assert.ok(fs.existsSync('test/assets/build/amd-jquery/foo/test/assets/src/Foo.js'));
				assert.ok(fs.existsSync('test/assets/build/amd-jquery/foo/test/assets/src/Bar.js'));
				assert.ok(fs.existsSync('test/assets/build/amd-jquery/metal/src/core.js'));

				var contents = fs.readFileSync('test/assets/build/amd-jquery/foo/test/assets/src/Foo.js', 'utf8');
				assert.notStrictEqual(-1, contents.indexOf('_JQueryAdapter2.default.register(\'foo\', Foo)'));
				done();
			});
		});
	});
});
