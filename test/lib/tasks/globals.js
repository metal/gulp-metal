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
var registerGlobalTasks = rewire('../../../lib/tasks/globals');
var renameAlias = rewire('../../../lib/renameAlias');

describe('Global Build Tasks', function() {
	before(function() {
		this.initialCwd_ = process.cwd();
		process.chdir(path.resolve(__dirname, '../assets'));

		build.__set__('renameAlias', renameAlias);
		renameAlias.__set__('getBowerDir',  function() {
			return path.resolve('bower_components');
		});
		registerGlobalTasks.__set__('build',  build);

		registerSoyTasks();
	});

	beforeEach(function(done) {
		del('build/globals', done);
	});

	after(function() {
		process.chdir(this.initialCwd_);
	});

	it('should build js files into a single bundle with globals', function(done) {
		registerGlobalTasks({
			bundleFileName: 'foo.js',
			globalName: 'foo'
		});

		gulp.start('build:globals', function() {
			var contents = fs.readFileSync('build/globals/foo.js', 'utf8');
			eval.call(global, contents);

			assert.ok(global.foo);
			assert.ok(global.foo.Bar);
			assert.ok(global.foo.Foo);

			var foo = new global.foo.Foo();
			assert.ok(foo instanceof global.foo.Bar);

			delete global.foo;
			done();
		});
	});

	it('should use task prefix when it\'s defined', function(done) {
		registerGlobalTasks({
			bundleFileName: 'foo.js',
			globalName: 'foo',
			taskPrefix: 'myPrefix:'
		});

		gulp.start('myPrefix:build:globals', function() {
			var contents = fs.readFileSync('build/globals/foo.js', 'utf8');
			eval.call(global, contents);

			assert.ok(global.foo);
			assert.ok(global.foo.Bar);
			assert.ok(global.foo.Foo);

			delete global.foo;
			done();
		});
	});

	it('should output minified version of the globals bundle', function(done) {
		registerGlobalTasks({
			bundleFileName: 'foo.js',
			globalName: 'foo'
		});

		gulp.start('build:globals', function() {
			assert.ok(fs.existsSync('build/globals/foo-min.js'));
			done();
		});
	});

	it('should output source file of the globals bundle', function(done) {
		registerGlobalTasks({
			bundleFileName: 'foo.js',
			globalName: 'foo'
		});

		gulp.start('build:globals', function() {
			assert.ok(fs.existsSync('build/globals/foo.js.map'));
			done();
		});
	});

	it('should trigger "end" event even when build:globals throws error for invalid js', function(done) {
		registerGlobalTasks({
			buildSrc: 'invalidSrc/Invalid.js',
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
});
