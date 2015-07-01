'use strict';

var assert = require('assert');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var registerSoyTasks = require('../../../lib/tasks/soy');
var rewire = require('rewire');
var sinon = require('sinon');

var build = rewire('../../../lib/pipelines/build');
var registerJQueryTasks = rewire('../../../lib/tasks/jquery');
var renameAlias = rewire('../../../lib/renameAlias');

describe('jQuery Build Tasks', function() {
	before(function() {
		this.initialCwd_ = process.cwd();
		process.chdir(path.resolve(__dirname, '../assets'));

		build.__set__('renameAlias', renameAlias);
		renameAlias.__set__('getBowerDir',  function() {
			return path.resolve('bower_components');
		});
		registerJQueryTasks.__set__('build',  build);

		registerSoyTasks();
	});

	after(function() {
		process.chdir(this.initialCwd_);
	});

	describe('Globals', function() {
		beforeEach(function(done) {
			del('build/globals-jquery', done);
		});

		it('should build js files into a single bundle with globals', function(done) {
			registerJQueryTasks({
				bundleFileName: 'foo.js',
				globalName: 'foo'
			});

			gulp.start('build:globals:jquery', function() {
				var contents = fs.readFileSync('build/globals-jquery/foo.js', 'utf8');
				assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'foo\', Foo)'));
				assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'bar\', Bar)'));
				assert.notStrictEqual(0, contents.indexOf('new (function () {'));
				done();
			});
		});

		it('should use task prefix when it\'s defined', function(done) {
			var options = {
				bundleFileName: 'foo.js',
				globalName: 'foo',
				taskPrefix: 'myPrefix:'
			};
			registerJQueryTasks(options);
			registerSoyTasks(options);

			gulp.start('myPrefix:build:globals:jquery', function() {
				var contents = fs.readFileSync('build/globals-jquery/foo.js', 'utf8');
				assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'foo\', Foo)'));
				assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'bar\', Bar)'));
				assert.notStrictEqual(0, contents.indexOf('new (function () {'));
				done();
			});
		});

		it('should output minified version of the jquery globals bundle', function(done) {
			registerJQueryTasks({
				bundleFileName: 'foo.js',
				globalName: 'foo'
			});

			gulp.start('build:globals:jquery', function() {
				assert.ok(fs.existsSync('build/globals-jquery/foo-min.js'));
				done();
			});
		});

		it('should output source file of the jquery globals bundle', function(done) {
			registerJQueryTasks({
				bundleFileName: 'foo.js',
				globalName: 'foo'
			});

			gulp.start('build:globals:jquery', function() {
				assert.ok(fs.existsSync('build/globals-jquery/foo.js.map'));
				done();
			});
		});

		it('should trigger "end" event even when build:globals:jquery throws error for invalid js', function(done) {
			registerJQueryTasks({
				buildSrc: 'invalidSrc/Invalid.js',
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

	describe('No Globals', function() {
		beforeEach(function(done) {
			del('build/jquery', done);
		});

		it('should build js files into a single bundle', function(done) {
			registerJQueryTasks({
				bundleFileName: 'foo.js',
				globalName: 'foo'
			});

			gulp.start('build:jquery', function() {
				var contents = fs.readFileSync('build/jquery/foo.js', 'utf8');
				assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'foo\', Foo)'));
				assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'bar\', Bar)'));
				assert.strictEqual(0, contents.indexOf('new (function () {'));
				done();
			});
		});

		it('should use task prefix when it\'s defined', function(done) {
			var options = {
				bundleFileName: 'foo.js',
				globalName: 'foo',
				taskPrefix: 'myPrefix:'
			};
			registerJQueryTasks(options);
			registerSoyTasks(options);

			gulp.start('myPrefix:build:jquery', function() {
				var contents = fs.readFileSync('build/jquery/foo.js', 'utf8');
				assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'foo\', Foo)'));
				assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'bar\', Bar)'));
				assert.strictEqual(0, contents.indexOf('new (function () {'));
				done();
			});
		});

		it('should output minified version of the jquery bundle', function(done) {
			registerJQueryTasks({
				bundleFileName: 'foo.js',
				globalName: 'foo'
			});

			gulp.start('build:jquery', function() {
				assert.ok(fs.existsSync('build/jquery/foo-min.js'));
				done();
			});
		});

		it('should output source file of the jquery bundle', function(done) {
			registerJQueryTasks({
				bundleFileName: 'foo.js',
				globalName: 'foo'
			});

			gulp.start('build:jquery', function() {
				assert.ok(fs.existsSync('build/jquery/foo.js.map'));
				done();
			});
		});

		it('should trigger "end" event even when build:jquery throws error for invalid js', function(done) {
			registerJQueryTasks({
				buildSrc: 'invalidSrc/Invalid.js',
				bundleFileName: 'invalid.js',
				globalName: 'invalid'
			});
			sinon.stub(console, 'error');

			gulp.start('build:jquery', function() {
				assert.strictEqual(1, console.error.callCount);
				console.error.restore();
				done();
			});
		});
	});
});
