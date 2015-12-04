'use strict';

var assert = require('assert');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var registerJQueryTasks = require('../../../lib/tasks/jquery');
var registerSoyTasks = require('../../../lib/tasks/soy');
var sinon = require('sinon');

describe('jQuery Build Tasks', function() {
	beforeEach(function(done) {
		gulp.reset();
		registerSoyTasks();
		del('test/assets/build/jquery').then(function() {
			done();
		});
	});

	it('should build js files into a single bundle', function(done) {
		registerJQueryTasks({
			buildSrc: 'test/assets/src/**.js',
			buildJqueryDest: 'test/assets/build/jquery',
			bundleFileName: 'foo.js',
			globalName: 'foo'
		});

		gulp.start('build:jquery', function() {
			var contents = fs.readFileSync('test/assets/build/jquery/foo.js', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'foo\', Foo)'));
			assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'bar\', Bar)'));
			assert.strictEqual(0, contents.indexOf('new (function () {'));
			done();
		});
	});

	it('should use task prefix when it\'s defined', function(done) {
		var options = {
			buildSrc: 'test/assets/src/**.js',
			buildJqueryDest: 'test/assets/build/jquery',
			bundleFileName: 'foo.js',
			globalName: 'foo',
			taskPrefix: 'myPrefix:'
		};
		registerJQueryTasks(options);
		registerSoyTasks(options);

		gulp.start('myPrefix:build:jquery', function() {
			var contents = fs.readFileSync('test/assets/build/jquery/foo.js', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'foo\', Foo)'));
			assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter.register(\'bar\', Bar)'));
			assert.strictEqual(0, contents.indexOf('new (function () {'));
			done();
		});
	});

	it('should output minified version and source map of the jquery bundle', function(done) {
		registerJQueryTasks({
			buildSrc: 'test/assets/src/**.js',
			buildJqueryDest: 'test/assets/build/jquery',
			bundleFileName: 'foo.js',
			globalName: 'foo'
		});

		gulp.start('build:jquery', function() {
			assert.ok(fs.existsSync('test/assets/build/jquery/foo-min.js'));
			assert.ok(fs.existsSync('test/assets/build/jquery/foo.js.map'));
			done();
		});
	});

	it('should trigger "end" event even when build:jquery throws error for invalid js', function(done) {
		registerJQueryTasks({
			buildSrc: 'test/assets/invalidSrc/Invalid.js',
			buildJqueryDest: 'test/assets/build/jquery',
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
