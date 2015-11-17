'use strict';

var assert = require('assert');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var registerGlobalTasks = require('../../../lib/tasks/globals');
var registerSoyTasks = require('../../../lib/tasks/soy');
var sinon = require('sinon');

describe('Global Build Tasks', function() {
	before(function() {
		this.initialCwd_ = process.cwd();
		process.chdir(path.resolve(__dirname, '../../assets'));
	});

	beforeEach(function(done) {
		gulp.reset();
		registerSoyTasks();
		del('build/globals').then(function() {
			done();
		});
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
		var options = {
			bundleFileName: 'foo.js',
			globalName: 'foo',
			taskPrefix: 'myPrefix:'
		};
		registerGlobalTasks(options);
		registerSoyTasks(options);

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

	it('should output source map file of the globals bundle', function(done) {
		registerGlobalTasks({
			bundleFileName: 'foo.js',
			globalName: 'foo'
		});

		gulp.start('build:globals', function() {
			assert.ok(fs.existsSync('build/globals/foo.js.map'));
			done();
		});
	});

	it('should add component registration calls', function(done) {
		registerGlobalTasks({
			bundleFileName: 'foo.js',
			globalName: 'foo'
		});

		gulp.start('build:globals', function() {
			var contents = fs.readFileSync('build/globals/foo.js', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('Foo.prototype.registerMetalComponent'));
			done();
		});
	});

	it('should not add component registration calls if skipAutoComponentRegistration is set to true', function(done) {
		registerGlobalTasks({
			bundleFileName: 'foo.js',
			globalName: 'foo',
			skipAutoComponentRegistration: true
		});

		gulp.start('build:globals', function() {
			var contents = fs.readFileSync('build/globals/foo.js', 'utf8');
			assert.strictEqual(-1, contents.indexOf('Foo.prototype.registerMetalComponent'));
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

	describe('jQuery', function() {
		beforeEach(function(done) {
			del('build/globals-jquery').then(function() {
				done();
			});
		});

		it('should build js files into a single bundle with globals', function(done) {
			registerGlobalTasks({
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
			registerGlobalTasks(options);
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
			registerGlobalTasks({
				bundleFileName: 'foo.js',
				globalName: 'foo'
			});

			gulp.start('build:globals:jquery', function() {
				assert.ok(fs.existsSync('build/globals-jquery/foo-min.js'));
				done();
			});
		});

		it('should output source file of the jquery globals bundle', function(done) {
			registerGlobalTasks({
				bundleFileName: 'foo.js',
				globalName: 'foo'
			});

			gulp.start('build:globals:jquery', function() {
				assert.ok(fs.existsSync('build/globals-jquery/foo.js.map'));
				done();
			});
		});

		it('should trigger "end" event even when build:globals:jquery throws error for invalid js', function(done) {
			registerGlobalTasks({
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
});
