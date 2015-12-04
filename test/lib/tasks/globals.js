'use strict';

var assert = require('assert');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var registerGlobalTasks = require('../../../lib/tasks/globals');
var registerSoyTasks = require('../../../lib/tasks/soy');
var sinon = require('sinon');

describe('Global Build Tasks', function() {
	beforeEach(function(done) {
		gulp.reset();
		registerSoyTasks();
		del('test/assets/build/globals').then(function() {
			done();
		});
	});

	it('should build js files into a single bundle with globals', function(done) {
		registerGlobalTasks({
			buildSrc: ['test/assets/src/**.js'],
			buildDest: 'test/assets/build/globals',
			bundleFileName: 'foo.js',
			globalName: 'foo'
		});

		gulp.start('build:globals', function() {
			assert.ok(fs.existsSync('test/assets/build/globals/foo.js'));
			assert.ok(fs.existsSync('test/assets/build/globals/foo-min.js'));
			assert.ok(fs.existsSync('test/assets/build/globals/foo.js.map'));
			done();
		});
	});

	it('should use task prefix when it\'s defined', function(done) {
		var options = {
			buildSrc: ['test/assets/src/**.js'],
			buildDest: 'test/assets/build/globals',
			bundleFileName: 'foo.js',
			globalName: 'foo',
			taskPrefix: 'myPrefix:'
		};
		registerGlobalTasks(options);
		registerSoyTasks(options);

		gulp.start('myPrefix:build:globals', function() {
			assert.ok(fs.existsSync('test/assets/build/globals/foo.js'));
			assert.ok(fs.existsSync('test/assets/build/globals/foo-min.js'));
			assert.ok(fs.existsSync('test/assets/build/globals/foo.js.map'));
			done();
		});
	});

	it('should trigger "end" event even when build:globals throws error for invalid js', function(done) {
		registerGlobalTasks({
			buildSrc: 'test/assets/invalidSrc/Invalid.js',
			buildDest: 'test/assets/build/globals',
			bundleFileName: 'invalid.js',
			globalName: 'invalid'
		});
		sinon.stub(console, 'error');

		gulp.start('build:globals', function() {
			assert.strictEqual(1, console.error.callCount);
			console.error.restore();
			done();
		});
	});

	describe('jQuery', function() {
		beforeEach(function(done) {
			del('test/assets/build/globals-jquery').then(function() {
				done();
			});
		});

		it('should build js files into a single bundle with globals', function(done) {
			registerGlobalTasks({
				buildSrc: ['test/assets/src/**.js'],
				buildGlobalsJqueryDest: 'test/assets/build/globals-jquery',
				bundleFileName: 'foo.js',
				globalName: 'foo'
			});

			gulp.start('build:globals:jquery', function() {
				var contents = fs.readFileSync('test/assets/build/globals-jquery/foo.js', 'utf8');
				assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'foo\', Foo)'));
				assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'bar\', Bar)'));
				assert.notStrictEqual(0, contents.indexOf('new (function () {'));
				done();
			});
		});

		it('should use task prefix when it\'s defined', function(done) {
			var options = {
				buildSrc: ['test/assets/src/**.js'],
				buildGlobalsJqueryDest: 'test/assets/build/globals-jquery',
				bundleFileName: 'foo.js',
				globalName: 'foo',
				taskPrefix: 'myPrefix:'
			};
			registerGlobalTasks(options);
			registerSoyTasks(options);

			gulp.start('myPrefix:build:globals:jquery', function() {
				var contents = fs.readFileSync('test/assets/build/globals-jquery/foo.js', 'utf8');
				assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'foo\', Foo)'));
				assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'bar\', Bar)'));
				assert.notStrictEqual(0, contents.indexOf('new (function () {'));
				done();
			});
		});

		it('should output minified version and source map of the jquery globals bundle', function(done) {
			registerGlobalTasks({
				buildSrc: ['test/assets/src/**.js'],
				buildGlobalsJqueryDest: 'test/assets/build/globals-jquery',
				bundleFileName: 'foo.js',
				globalName: 'foo'
			});

			gulp.start('build:globals:jquery', function() {
				assert.ok(fs.existsSync('test/assets/build/globals-jquery/foo-min.js'));
				assert.ok(fs.existsSync('test/assets/build/globals-jquery/foo.js.map'));
				done();
			});
		});

		it('should trigger "end" event even when build:globals:jquery throws error for invalid js', function(done) {
			registerGlobalTasks({
				buildSrc: 'test/assets/invalidSrc/Invalid.js',
				buildGlobalsJqueryDest: 'test/assets/build/globals-jquery',
				bundleFileName: 'invalid.js',
				globalName: 'invalid'
			});
			sinon.stub(console, 'error');

			gulp.start('build:globals:jquery', function() {
				assert.strictEqual(1, console.error.callCount);
				console.error.restore();
				done();
			});
		});
	});
});
